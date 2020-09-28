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
var TSOS;
(function (TSOS) {
    var Control = /** @class */ (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };
        Control.resetCanvas = function () {
            _Canvas.height = 500;
            _Canvas.width = 500;
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // Update the graphical taskbar
            var taTaskBar = document.getElementById("taTaskBar");
            taTaskBar.innerHTML = "";
            var dateElement = document.createElement('p');
            var statusElement = document.createElement('p');
            dateElement.innerHTML = "Date: " + new Date().toLocaleString();
            statusElement.innerHTML = "Status: " + _Status;
            taTaskBar.appendChild(dateElement);
            taTaskBar.appendChild(statusElement);
            // TODO in the future: Optionally update a log database or some streaming service.
        };
        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            // Create and initialize the memory and accessor (also parts of hardware)
            _Memory = new TSOS.Memory();
            _Memory.init();
            _MemoryAccessor = new TSOS.MemoryAccessor();
            // Create and initialize the process manager
            _ProcessManager = new TSOS.ProcessManager();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        };
        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };
        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };
        Control.hostBtnToggleStep_click = function (btn) {
            _SingleStep = !_SingleStep;
            document.getElementById("single_step").innerHTML = "Single Step: " +
                (_SingleStep ? "On" : "Off");
            for (var i = 0; i < _ProcessManager.getProcessList().length; i++) {
                if (_ProcessManager.getPCB(i).getState() === "Executing") {
                    _CPU.isExecuting = true;
                }
            }
        };
        Control.hostBtnStep_click = function (btn) {
            for (var i = 0; i < _ProcessManager.getProcessList().length; i++) {
                if (_ProcessManager.getPCB(i).getState() === "Executing") {
                    _CPU.isExecuting = true;
                }
            }
        };
        Control.updateAllDisplays = function () {
            this.updateCPUDisplay();
            this.updatePCBDisplay();
            this.updateMemoryDisplay();
        };
        Control.updateCPUDisplay = function () {
            var table = document.getElementById('cpu');
            var tableContent = "<tbody>" +
                "<tr>" +
                "<th>PC</th><th>Acc</th><th>X</th><th>Y</th><th>Z</th>" +
                "</tr>" +
                "<tr>" +
                ("<td>" + _CPU.getPC() + "</td>") +
                ("<td>" + _CPU.getAcc() + "</td>") +
                ("<td>" + _CPU.getXReg() + "</td>") +
                ("<td>" + _CPU.getYReg() + "</td>") +
                ("<td>" + _CPU.getZFlag() + "</td>") +
                "</tr>" +
                "</tbody>";
            table.innerHTML = tableContent;
        };
        Control.updatePCBDisplay = function () {
            var table = document.getElementById('pcb');
            var tableContent = "<tbody>" +
                "<tr>" +
                "<th>PID</th><th>PC</th><th>Acc</th><th>X</th><th>Y</th><th>Z</th><th>State</th>" +
                "</tr>";
            if (_ProcessManager.getProcessList().length > 0) {
                for (var pid = 0; pid < _ProcessManager.getProcessList().length; pid++) {
                    var process = _ProcessManager.getPCB(pid);
                    tableContent += ("<tr>" +
                        ("<td>" + pid + "</td>") +
                        ("<td>" + process.getPC() + "</td>") +
                        ("<td>" + process.getAcc() + "</td>") +
                        ("<td>" + process.getXReg() + "</td>") +
                        ("<td>" + process.getYReg() + "</td>") +
                        ("<td>" + process.getZFlag() + "</td>") +
                        ("<td>" + process.getState() + "</td>") +
                        "</tr>");
                }
            }
            else {
                tableContent += "<tr><td colspan='7'>No programs have been loaded</td></tr>";
            }
            tableContent += "</tbody>";
            table.innerHTML = tableContent;
        };
        // Initialize and populate table to display memory
        Control.initMemoryDisplay = function () {
            var table = document.getElementById("memory");
            table.innerHTML = "";
            var tableContent = "<tbody>";
            for (var i = 0; i < _Memory.memory.length; i += 0x8) {
                var row = TSOS.Utils.padHex(TSOS.Utils.decToHex(i), 2).toUpperCase();
                tableContent += "<tr class=\"memory-row\"><td>" + row + "</td>";
                // Need to keep track of current search index and append 8 cells with proper id
                // to the table
                for (var j = i; j < i + 8; j += 0x1) {
                    var cell = _Memory.getMemory(j.toString()).toUpperCase();
                    tableContent += "<td id=\"mem-cell-" + j + "\">" + cell + "</td>";
                }
                tableContent += "</tr>";
            }
            tableContent += "</tbody>";
            table.innerHTML = tableContent;
        };
        // Initialize and populate table to display memory
        Control.updateMemoryDisplay = function () {
            for (var i = 0; i < _Memory.memory.length; i++) {
                var element = $("#mem-cell-" + i);
                element.html(_MemoryAccessor.readByte(TSOS.Utils.decToHex(i)));
            }
        };
        Control.highlightMemoryDisplay = function (instruction) {
            var tableElements = $("#memory tbody *");
            tableElements.removeAttr('style');
            for (var offset = 0; offset < instruction.getPCInc(); offset++) {
                var cell = $("#mem-cell-" + (_CPU.getPC() + offset));
                if (offset === 0) {
                    cell.css("color", "green");
                }
                else {
                    cell.css("color", "red");
                }
            }
        };
        Control.clearPCBDisplay = function () {
            var table = document.getElementById('pcb');
            table.innerHTML = ' <table id="pcb" class="table table-responsive text-center">' +
                '   <tr>' +
                '    <th>PID</th>' +
                '    <th>PC</th>' +
                '    <th>Acc</th>' +
                '    <th>XReg</th>' +
                '    <th>YReg</th>' +
                '    <th>ZFlag</th>' +
                '    <th>Status</th>' +
                '   </tr>' +
                ' </table>';
        };
        return Control;
    }());
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
