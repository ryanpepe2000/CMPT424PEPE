/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static resetCanvas(): void{
            _Canvas.height = 500;
            _Canvas.width = 500;
        }

        public static hostLog(msg: string, source: string = "?"): void {

            // Note the OS CLOCK.
            let clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            let now: number = new Date().getTime();

            // Build the log string.
            let str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            let taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // Update the graphical taskbar
            let taTaskBar = <HTMLInputElement> document.getElementById("taTaskBar");
            taTaskBar.innerHTML = "";
            let dateElement = document.createElement('p');
            let statusElement = document.createElement('p');
            dateElement.innerHTML = "Date: " + new Date().toLocaleString();
            statusElement.innerHTML = "Status: " + _Status;
            taTaskBar.appendChild(dateElement);
            taTaskBar.appendChild(statusElement);

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // Create CPU Scheduler
            _Scheduler = new Scheduler();

            // Create and initialize the memory and accessor (also parts of hardware)
            _Memory = new Memory();
            _Memory.init();
            _MemoryAccessor = new MemoryAccessor();
            _MMU = new MemoryManager();

            // Create and initialize the process manager
            _ProcessManager = new ProcessManager();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
        public static hostBtnToggleStep_click(btn): void {
            _SingleStep = !_SingleStep;
            document.getElementById("single_step").innerHTML = "Single Step: " +
                (_SingleStep ? "On" : "Off");
            for (let i = 0; i < _ProcessManager.getProcessList().length; i++){
                if (_ProcessManager.getPCB(i).getState() === "Running"){
                    _CPU.isExecuting = true;
                }
            }
        }

        public static hostBtnStep_click(btn): void {
            for (let i = 0; i < _ProcessManager.getProcessList().length; i++){
                if (_ProcessManager.getPCB(i).getState() === "Running"){
                    _CPU.isExecuting = true;
                }
            }
        }

        // To be used on every clock pulse. Updates all displays accordingly
        static updateAllDisplays(){
            this.updateCPUDisplay();
            this.updatePCBDisplay();
            this.updateMemoryDisplay();
        }

        // Builds the CPU display and constantly updates
        static updateCPUDisplay() {
            let table = document.getElementById('cpu');
            let tableContent =
                "<tbody>" +
                    "<tr>" +
                        "<th>PC</th><th>Acc</th><th>X</th><th>Y</th><th>Z</th>" +
                    "</tr>" +
                    "<tr>" +
                        `<td>${_CPU.getPC()}</td>` +
                        `<td>${_CPU.getAcc()}</td>` +
                        `<td>${_CPU.getXReg()}</td>` +
                        `<td>${_CPU.getYReg()}</td>` +
                        `<td>${_CPU.getZFlag()}</td>` +
                    "</tr>" +
                "</tbody>";
            table.innerHTML = tableContent;
        }

        // Builds the PCB display and constantly updates
        static updatePCBDisplay(){
            let table = document.getElementById('pcb');
            let tableContent =
                "<tbody>" +
                    "<tr>" +
                        "<th>PID</th><th>PC</th><th>Acc</th><th>X</th><th>Y</th><th>Z</th><th>State</th><th>Segment</th>" +
                    "</tr>";
            if (_ProcessManager.getProcessList().length > 0){
                for (let pid = 0; pid < _ProcessManager.getProcessList().length; pid++){
                    let process =  _ProcessManager.getPCB(pid);
                    tableContent += (
                        `<tr>` +
                            `<td>${pid}</td>` +
                            `<td>${process.getPC()}</td>` +
                            `<td>${process.getAcc()}</td>` +
                            `<td>${process.getXReg()}</td>` +
                            `<td>${process.getYReg()}</td>` +
                            `<td>${process.getZFlag()}</td>` +
                            `<td>${process.getState()}</td>` +
                            `<td>${process.getSegment()}</td>` +
                        `</tr>`
                    );
                }
            } else {
                tableContent += "<tr><td colspan='7'>No programs have been loaded</td></tr>";
            }
            tableContent += "</tbody>";
            table.innerHTML = tableContent;
        }


        // Initialize and populate table to display memory
        static initMemoryDisplay() {
            let table = document.getElementById("memory");
            table.innerHTML = "";
            let tableContent =
                "<tbody>";
            for (let i = 0; i < _Memory.memory.length; i+=0x8) {
                let row = Utils.padHex(Utils.decToHex(i), 2).toUpperCase();
                tableContent += `<tr class="memory-row"><td>${row}</td>`;
                // Need to keep track of current search index and append 8 cells with proper id
                // to the table
                for (let j = i; j < i + 8; j+=0x1){
                    let cell = _Memory.getMemory(j.toString());
                    tableContent+=`<td id="mem-cell-${j}">${cell}</td>`;
                }
                tableContent += "</tr>";
            }
            tableContent += "</tbody>";
            table.innerHTML = tableContent;
        }

        // Updates every memory block item to display properly
        static updateMemoryDisplay() {
            for (let i = 0; i < _Memory.memory.length; i++) {
                let element = $(`#mem-cell-${i}`);
                element.html(_Memory.getMemory(Utils.decToHex(i)));
            }
        }

        // Applies color the current IR and its parameters
        static highlightMemoryDisplay() {
            let instr = _CPU.getInstruction(_Memory.getMemory(Utils.decToHex(_MMU.translateAddress(_CPU.getPC(), _CPU.segment))));
            let tableElements = $("#memory tbody *");
            tableElements.removeAttr('style');
            if (instr !== undefined) { // Ensures that the instruction is valid in case of invalid user input (prevents crash)
                for (let offset = 0; offset < instr.getPCInc(); offset++){
                    let cell = $(`#mem-cell-${_MMU.translateAddress(_CPU.getPC() + offset, _CPU.segment)}`);
                    if (offset === 0){
                        cell.css("color", "green");
                    } else {
                        cell.css("color", "red");
                    }
                }
            }
        }
    }
}
