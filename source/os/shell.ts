/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */


// TODO: Write a base class / prototype for system services and let Shell inherit from it.
module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];

        public history = new CMDHistory();

        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                "ver",
                "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                "help",
                "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                "shutdown",
                "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                "cls",
                "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                "man",
                "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                "trace",
                "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                "rot13",
                "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                "prompt",
                "<string> - Sets the prompt.");

            // date
            sc = new ShellCommand(this.shellDate,
                "date",
                "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereAmI,
                "whereami",
                "- Displays the user's location");
            this.commandList[this.commandList.length] = sc;

            // bond
            sc = new ShellCommand(this.shellBond,
                "bond",
                "- Bond. James Bond.");
            this.commandList[this.commandList.length] = sc;

            // bsod
            sc = new ShellCommand(this.shellBSOD,
                "bsod",
                "- Breaks the OS displaying the BSOD.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                "load",
                "- Validates the user's code is in hexadecimal.");
            this.commandList[this.commandList.length] = sc;

            // status
            sc = new ShellCommand(this.shellStatus,
                "status",
                "- Updates the status message in taskbar.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun,
                "run",
                "- Executes a user program.");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new ShellCommand(this.shellRunAll,
                "runall",
                "- Adds all loaded programs to the ready queue");
            this.commandList[this.commandList.length] = sc;

            // kill
            sc = new ShellCommand(this.shellKill,
                "kill",
                "- Terminates a user program");
            this.commandList[this.commandList.length] = sc;

            // killall
            sc = new ShellCommand(this.shellKillAll,
                "killall",
                "- Terminated all user programs on the ready queue");
            this.commandList[this.commandList.length] = sc;

            // clear memory
            sc = new ShellCommand(this.shellClearMemory,
                "clearmem",
                "- Clears the system memory.");
            this.commandList[this.commandList.length] = sc;

            // quantum
            sc = new ShellCommand(this.shellQuantum,
                "quantum",
                "- Updates the system quantum.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new ShellCommand(this.shellProcesses,
                "ps",
                "- Lists all processes in ready queue and their state.");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new ShellCommand(this.shellFormatDisk,
                "format",
                "- Formats the hard drive and reinitializes all values.");
            this.commandList[this.commandList.length] = sc;

            // create
            sc = new ShellCommand(this.shellCreateFile,
                "create",
                "- <filename> Creates a file");
            this.commandList[this.commandList.length] = sc;

            // read
            sc = new ShellCommand(this.shellReadFile,
                "read",
                "- <filename> Reads a specified file");
            this.commandList[this.commandList.length] = sc;

            // write
            sc = new ShellCommand(this.shellWriteFile,
                "write",
                "- <filename> Writes to a specified file");
            this.commandList[this.commandList.length] = sc;

            // list
            sc = new ShellCommand(this.shellListFiles,
                "ls",
                "- <filename> Lists all files in the directory");
            this.commandList[this.commandList.length] = sc;

            // delete
            sc = new ShellCommand(this.shellDeleteFile,
                "delete",
                "- <filename> Deletes a file");
            this.commandList[this.commandList.length] = sc;

            // getSchedule
            sc = new ShellCommand(this.shellGetSchedule,
                "getschedule",
                "- Lists the name of the current scheduling algorithm");
            this.commandList[this.commandList.length] = sc;

            // setSchedule
            sc = new ShellCommand(this.shellSetSchedule,
                "setschedule",
                "- <fcfs | rr | priority> Sets the scheduling algorithm");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        public autoComplete(text: string): string {
            let retVal = "";
            let numMatches = 0;
            // Go through each command and check character by character
            // if the current text matches any commands. 'numMatches' is used
            // to store the current retVal's number of matches. If a different command
            // has a higher number of matches, it will be replaced with retVal.
            for (let i = 0; i < this.commandList.length; i++) {
                let cmd = this.commandList[i].getCmdName();
                console.log("Command: " + cmd);
                for (let idx = 0, currMatches = 0; idx < text.length; idx++) {
                    console.log("Checking if buffer text: " + text.charAt(idx) + " == command text: " + cmd.charAt(idx));
                    if (cmd.charAt(idx) === text.charAt(idx)) {
                        currMatches++;
                        if (numMatches <= currMatches) {
                            numMatches = currMatches;
                            retVal = cmd;
                        }
                    } else {
                        break;
                    }
                }
            }
            return retVal;
        }


        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }

        public shellCls(args: string[]) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("Ver displays the current OS version.");
                        break;
                    case "man":
                        _StdOut.putText("If you dont know what 'man' does then you need to reevaluate.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shut's down the OS while keeping the CPU running passively.");
                        break;
                    case "cls":
                        _StdOut.putText("Clear screen resets the cursor position and the state of the display.");
                        break;
                    case "trace":
                        _StdOut.putText("Trace toggles the status of the OS tracer.");
                        break;
                    case "rot13":
                        _StdOut.putText("Converts a string using the rot13 cipher.");
                        break;
                    case "prompt":
                        _StdOut.putText("Prompt changes the default character at the start of each line prompt.");
                        break;
                    case "date":
                        _StdOut.putText("Date simply displays the current system date.");
                        break;
                    case "whereami":
                        _StdOut.putText("WhereAmI provides the current location to the user.");
                        break;
                    case "bond":
                        _StdOut.putText("Provides a random James Bond quote (Don't worry, there's no Craig).");
                        break;
                    case "bsod":
                        _StdOut.putText("BSOD throws an OS Trap");
                        break;
                    case "load":
                        _StdOut.putText("Validates that the user code is in hex.");
                        break;
                    case "status":
                        _StdOut.putText("Updates the status message");
                        break;
                    case "run":
                        _StdOut.putText("Adds user program to the ready queue");
                        break;
                    case "runall":
                        _StdOut.putText("Adds all user programs to the ready queue");
                        break;
                    case "kill":
                        _StdOut.putText("Removes a program from the ready queue");
                        break;
                    case "killall":
                        _StdOut.putText("Removes all programs from the ready queue");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clears the entire system memory");
                        break;
                    case "quantum":
                        _StdOut.putText("Changes the number of cycles for CPU scheduling");
                        break;
                    case "ps":
                        _StdOut.putText("Lists all processes and their states");
                        break;
                    case "format":
                        _StdOut.putText("Reformats the file system");
                        break;
                    case "create":
                        _StdOut.putText("Creates a file");
                        break;
                    case "write":
                        _StdOut.putText("Writes to a file");
                        break;
                    case "delete":
                        _StdOut.putText("Deletes a file");
                        break;
                    case "getSchedule":
                        _StdOut.putText("Gets the name of the current CPU scheduling algorithm");
                        break;
                    case "setSchedule":
                        _StdOut.putText("Sets the current CPU scheduling algorithm");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(args: string[]) {
            _StdOut.putText("Current Date: " + new Date().toLocaleString() + ".");
        }

        public shellWhereAmI(args: string[]) {
            _StdOut.putText("Find a map dummy.");
        }

        public shellBond(args: string[]) {
            let quotes: string[] = ["Bond. James Bond.", "Oh, just a drink. A martini, shaken, not stirred.",
                "There's a saying in England: Where there's smoke there's fire.", "I think he got the point.",
                "Just a slight stiffness coming on... In the shoulder.", "Keeping the British end up, sir.",
                "I thought Christmas only comes once a year.", "Shocking. Positively shocking.",
                "That's just as bad as listening to the Beatles without earmuffs.", "I must be dreaming.",
                "I always enjoyed studying a new tongue.", "The things I do for England.",
                "This never happened to the other fella.", "Beg your pardon. Forgot to knock.",
                "World domination. Same old dream.", "Excuse my friend. She's just dead."];
            _StdOut.putText(quotes[Math.floor((quotes.length - 1) * Math.random())]);
        }

        public shellBSOD(args: string[]) {
            _Kernel.krnTrapError("Blue screen of death");
        }

        public shellLoad(args: string[]) {
            if (Shell.validateCode()){
                let userCode = (<HTMLInputElement> document.getElementById("taProgramInput")).value.split(" ");
                if (_MMU.memoryAvailable()){
                    let segment = _MMU.getAvailableSegment();
                    // Ensure user code can fit in one memory block
                    if (userCode.length - 1 > MEMORY_LENGTH){
                        _StdOut.putText("Valid Code. Program is too long.");
                        return;
                    } else {
                        // Create PCB and add it to the Resident List
                        if (args[0] === undefined){
                            let pcb: ProcessControlBlock = _ProcessManager.createProcess(segment);
                            _MMU.fillSegment(segment, userCode);
                            _StdOut.putText("Process Loaded. PID: " + pcb.pid);
                        } else {
                            let priority = args[0];
                            if (/^-?[\d.]+(?:e-?\d+)?$/.test(priority)){
                                let priorityNum = parseInt(priority);
                                let pcb: ProcessControlBlock = _ProcessManager.createProcess(segment, priorityNum);
                                _MMU.fillSegment(segment, userCode);
                                _StdOut.putText("Process Loaded. PID: " + pcb.pid + " | Priority: " + priority);
                            } else {
                                _StdOut.putText("Please enter a valid priority.");
                            }
                        }
                    }
                }
                // Create a swap file and write code to it
                else {
                    if (userCode.length - 1 > MEMORY_LENGTH){
                        _StdOut.putText("Valid Code. Program is too long.");
                        return;
                    } else {
                        // Create PCB and add it to the Resident List and write to the disk
                        let pcb: ProcessControlBlock = _ProcessManager.createProcess(_ProcessManager.HARD_DRIVE);
                        // Create the swap
                        let filename = "process-" + pcb.getPID()+ ".~swp";
                        // Reformat the code in quotes and add '00' at the end to guarantee termination
                        let code = userCode.join("");
                        // Call HD device driver functions to create and write to a swap file
                        _HardDriveManager.createFile(filename);
                        _HardDriveManager.writeFile(filename, code);
                        _StdOut.putText("Process Loaded. PID: " + pcb.pid);
                    }
                }
            } else {
                _StdOut.putText("Invalid program syntax.");
            }
        }

        // Helper method for shellLoad()
        // Reformats user code and returns true if it is valid
        private static validateCode(): boolean{
            let acceptedValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
            let retVal = "";
            let userCodeHTML = <HTMLInputElement>document.getElementById("taProgramInput");
            let userCode = userCodeHTML.value.toUpperCase().split(" ").join("").split("\n").join(""); // Removes all spaces and new lines
            let invalidCode: boolean = userCode.length <= 0; // Ensures code is not empty
            // Iterate through chars in input element and verify characters are valid. Format properly
            for (let idx = 0, counter = 0; idx < userCode.length; idx++){
                if (acceptedValues.indexOf(userCode.charAt(idx)) !== -1){ // Character is a valid hex value
                    retVal+= userCode.charAt(idx);
                    counter++;
                } else {
                    invalidCode = true;
                    break;
                }
                if (counter % 2 == 0){
                    retVal += " ";
                }
            }
            if (invalidCode){
                return false;
            } else {
                if (userCode.length % 2 == 1){
                    userCodeHTML.value = retVal+"0";
                } else {
                    userCodeHTML.value = retVal;
                }
                return true;
            }
        }

        public shellStatus(args: string[]) {
            if (args.length > 0) {
                _Status = "";
                args.forEach(function(arg){
                    _Status = _Status + " " + arg;
                });
            } else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        }

        public shellRun(args: string[]) {
            if (args.length > 0) {
                let pid = parseInt(args[0]);
                let pcb = _ProcessManager.getPCB(pid);
                if (pcb != undefined && pcb.state !== "Terminated") {
                    _CPU.startProcess(pcb);
                } else {
                    if (_SarcasticMode) {
                        _StdOut.putText("You idiot, there is not program with that ID.");
                    } else {
                        _StdOut.putText("Program ID <" + pid + "> is invalid.");
                    }
                }
                Control.highlightMemoryDisplay();
            }
        }


        public shellRunAll(args: string[]) {
            _CPU.startAllProcesses();
            Control.highlightMemoryDisplay();
        }

        public shellKill(args: string[]) {
            if (args.length > 0) {
                let pcb = _ProcessManager.getPCB(parseInt(args[0]));
                if (pcb !== null) {
                    _CPU.endProcess(pcb);
                }
                Control.highlightMemoryDisplay();
            }
        }

        public shellKillAll(args: string[]) {
            _CPU.endAllProcesses();
            Control.highlightMemoryDisplay();
        }

        public shellClearMemory(args: string[]) {
            _Memory.resetMemory();
            for (let pcb of _ProcessManager.getProcessList()){
                pcb.setState("Terminated");
            }
            _CPU.isExecuting = false;
        }

        public shellQuantum(args: string[]) {
            if (args.length > 0) {
                let newQuantum = parseInt(args[0]);
                if (newQuantum !== undefined && newQuantum > 0){
                    _Quantum = newQuantum;
                    _Scheduler.updateQuantum();
                } else {
                    _StdOut.putText("Invalid quantum value.")
                }
            }
        }

        public shellProcesses(args: string[]) {
            for (let pcb of _ProcessManager.getProcessList()){
                _StdOut.putText("Process " + pcb.pid + ": " + pcb.state);
                _StdOut.advanceLine();
            }
        }

        // File System Commands
        public shellCreateFile(args: string[]){
            args = ["create"].concat(args);
            TSOS.Shell.shellDiskOp(args);
        }
        public shellReadFile(args: string[]){
            args = ["read"].concat(args);
            TSOS.Shell.shellDiskOp(args);
        }
        public shellWriteFile(args: string[]){
            args = ["write"].concat(args);
            TSOS.Shell.shellDiskOp(args);
        }
        public shellDeleteFile(args: string[]){
            args = ["delete"].concat(args);
            TSOS.Shell.shellDiskOp(args);
        }
        public shellListFiles(args: string[]){
            args = ["list"].concat(args);
            TSOS.Shell.shellDiskOp(args);
        }
        public shellFormatDisk(args: string[]){
            args = ["format"].concat(args);
            TSOS.Shell.shellDiskOp(args);
        }
        private static shellDiskOp(args: string[]) {
            // Enqueue a new interrupt to process the disk operation
            _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_IRQ, args));
        }

        // CPU Algorithms
        public shellGetSchedule(args: string[]){
            _StdOut.putText("Current Schedule: " + _Scheduler.getAlgorithm());
        }

        // CPU Algorithms
        public shellSetSchedule(args: string[]){
           if (args.length > 0){
               let schedule = args[0].toLowerCase();
               if (schedule === "fcfs" || schedule === "rr" || schedule === "priority"){
                   _Scheduler.setAlgorithm(schedule);
               } else {
                   _StdOut.putText("Invalid algorithm type");
               }
           }
        }

    }

    // Console history is used in traversal of previous commands.
    // There are only four functions necessary in this class for complete functionality:
    // Add, forward, backward, getCmd, and resetPos
    class CMDHistory {
        private cmdList = [];
        private pos = -1;

        public add(cmd: String){
            this.cmdList.push(cmd);
            this.resetPos();
        }

        public forward(): void{
            while (this.pos < this.cmdList.length - 1 && this.pos !== -1){
                if (this.cmdList[this.pos] != this.cmdList[this.pos+1]){
                    this.pos++;
                    break;
                } else {
                    this.pos++;
                }
            }
        }

        public backward(): void{
            while (this.pos > 0) {
                if (this.cmdList[this.pos] != this.cmdList[this.pos-1]){
                    this.pos--;
                    break;
                } else {
                    this.pos--;
                }
            }
        }

        public getCMD(): string{
            return this.cmdList[this.pos];
        }

        private resetPos(): void{
            this.pos = this.cmdList.length - 1;
        }
    }
}
