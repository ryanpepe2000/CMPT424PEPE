/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.history = new CMDHistory();
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Displays the user's location");
            this.commandList[this.commandList.length] = sc;
            // bond
            sc = new TSOS.ShellCommand(this.shellBond, "bond", "- Bond. James Bond.");
            this.commandList[this.commandList.length] = sc;
            // bsod
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- Breaks the OS displaying the BSOD.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Validates the user's code is in hexadecimal.");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "- Updates the status message in taskbar.");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "- Executes a user program.");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- Adds all loaded programs to the ready queue");
            this.commandList[this.commandList.length] = sc;
            // kill
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "- Terminates a user program");
            this.commandList[this.commandList.length] = sc;
            // killall
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", "- Terminated all user programs on the ready queue");
            this.commandList[this.commandList.length] = sc;
            // clear memory
            sc = new TSOS.ShellCommand(this.shellClearMemory, "clearmem", "- Clears the system memory.");
            this.commandList[this.commandList.length] = sc;
            // quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "- Updates the system quantum.");
            this.commandList[this.commandList.length] = sc;
            // ps
            sc = new TSOS.ShellCommand(this.shellProcesses, "ps", "- Lists all processes in ready queue and their state.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
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
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
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
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        Shell.prototype.autoComplete = function (text) {
            var retVal = "";
            var numMatches = 0;
            // Go through each command and check character by character
            // if the current text matches any commands. 'numMatches' is used
            // to store the current retVal's number of matches. If a different command
            // has a higher number of matches, it will be replaced with retVal.
            for (var i = 0; i < this.commandList.length; i++) {
                var cmd = this.commandList[i].getCmdName();
                console.log("Command: " + cmd);
                for (var idx = 0, currMatches = 0; idx < text.length; idx++) {
                    console.log("Checking if buffer text: " + text.charAt(idx) + " == command text: " + cmd.charAt(idx));
                    if (cmd.charAt(idx) === text.charAt(idx)) {
                        currMatches++;
                        if (numMatches <= currMatches) {
                            numMatches = currMatches;
                            retVal = cmd;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
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
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
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
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function (args) {
            _StdOut.putText("Current Date: " + new Date().toLocaleString() + ".");
        };
        Shell.prototype.shellWhereAmI = function (args) {
            _StdOut.putText("Find a map dummy.");
        };
        Shell.prototype.shellBond = function (args) {
            var quotes = ["Bond. James Bond.", "Oh, just a drink. A martini, shaken, not stirred.",
                "There's a saying in England: Where there's smoke there's fire.", "I think he got the point.",
                "Just a slight stiffness coming on... In the shoulder.", "Keeping the British end up, sir.",
                "I thought Christmas only comes once a year.", "Shocking. Positively shocking.",
                "That's just as bad as listening to the Beatles without earmuffs.", "I must be dreaming.",
                "I always enjoyed studying a new tongue.", "The things I do for England.",
                "This never happened to the other fella.", "Beg your pardon. Forgot to knock.",
                "World domination. Same old dream.", "Excuse my friend. She's just dead."];
            _StdOut.putText(quotes[Math.floor((quotes.length - 1) * Math.random())]);
        };
        Shell.prototype.shellBSOD = function (args) {
            _Kernel.krnTrapError("Blue screen of death");
        };
        Shell.prototype.shellLoad = function (args) {
            if (Shell.validateCode()) {
                var userCode = document.getElementById("taProgramInput").value.split(" ");
                if (_MMU.memoryAvailable()) {
                    var segment = _MMU.getAvailableSegment();
                    // Ensure user code can fit in one memory block
                    if (userCode.length - 1 > MEMORY_LENGTH) {
                        _StdOut.putText("Valid Code. Program is too long.");
                        return;
                    }
                    else {
                        // Create PCB and add it to the Resident List
                        var pcb = _ProcessManager.createProcess(segment);
                        _MMU.fillSegment(segment, userCode);
                        _StdOut.putText("Process Loaded. PID: " + pcb.pid);
                    }
                }
                else {
                    _StdOut.putText("Valid Code. Memory is not currently available.");
                }
            }
            else {
                _StdOut.putText("Invalid program syntax.");
            }
        };
        // Helper method for shellLoad()
        // Reformats user code and returns true if it is valid
        Shell.validateCode = function () {
            var acceptedValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
            var retVal = "";
            var userCodeHTML = document.getElementById("taProgramInput");
            var userCode = userCodeHTML.value.toUpperCase().split(" ").join("").split("\n").join(""); // Removes all spaces and new lines
            var invalidCode = userCode.length <= 0; // Ensures code is not empty
            // Iterate through chars in input element and verify characters are valid. Format properly
            for (var idx = 0, counter = 0; idx < userCode.length; idx++) {
                if (acceptedValues.indexOf(userCode.charAt(idx)) !== -1) { // Character is a valid hex value
                    retVal += userCode.charAt(idx);
                    counter++;
                }
                else {
                    invalidCode = true;
                    break;
                }
                if (counter % 2 == 0) {
                    retVal += " ";
                }
            }
            if (invalidCode) {
                return false;
            }
            else {
                if (userCode.length % 2 == 1) {
                    userCodeHTML.value = retVal + "0";
                }
                else {
                    userCodeHTML.value = retVal;
                }
                return true;
            }
        };
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                _Status = "";
                args.forEach(function (arg) {
                    _Status = _Status + " " + arg;
                });
            }
            else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellRun = function (args) {
            if (args.length > 0) {
                var pcb = _ProcessManager.getPCB(parseInt(args[0]));
                if (pcb !== null && pcb.state !== "Terminated") {
                    _CPU.startProcess(pcb);
                }
                TSOS.Control.highlightMemoryDisplay();
            }
        };
        Shell.prototype.shellRunAll = function (args) {
            for (var _i = 0, _a = _ProcessManager.getProcessList(); _i < _a.length; _i++) {
                var process = _a[_i];
                if (process.getState() == "New") {
                    _CPU.startProcess(process);
                }
            }
            TSOS.Control.highlightMemoryDisplay();
        };
        Shell.prototype.shellKill = function (args) {
            if (args.length > 0) {
                var pcb = _ProcessManager.getPCB(parseInt(args[0]));
                if (pcb !== null) {
                    _CPU.endProcess(pcb);
                }
                TSOS.Control.highlightMemoryDisplay();
            }
        };
        Shell.prototype.shellKillAll = function (args) {
            _CPU.endAllProcesses();
            TSOS.Control.highlightMemoryDisplay();
        };
        Shell.prototype.shellClearMemory = function (args) {
            _Memory.resetMemory();
        };
        Shell.prototype.shellQuantum = function (args) {
            if (args.length > 0) {
                var newQuantum = parseInt(args[0]);
                if (newQuantum !== undefined && newQuantum > 0) {
                    _Quantum = newQuantum;
                    _Scheduler.updateQuantum();
                }
                else {
                    _StdOut.putText("Invalid quantum value.");
                }
            }
        };
        Shell.prototype.shellProcesses = function (args) {
            for (var _i = 0, _a = _ProcessManager.getProcessList(); _i < _a.length; _i++) {
                var pcb = _a[_i];
                _StdOut.putText("Process " + pcb.pid + ": " + pcb.state);
                _StdOut.advanceLine();
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
    // Console history is used in traversal of previous commands.
    // There are only four functions necessary in this class for complete functionality:
    // Add, forward, backward, getCmd, and resetPos
    var CMDHistory = /** @class */ (function () {
        function CMDHistory() {
            this.cmdList = [];
            this.pos = -1;
        }
        CMDHistory.prototype.add = function (cmd) {
            this.cmdList.push(cmd);
            this.resetPos();
        };
        CMDHistory.prototype.forward = function () {
            while (this.pos < this.cmdList.length - 1 && this.pos !== -1) {
                if (this.cmdList[this.pos] != this.cmdList[this.pos + 1]) {
                    this.pos++;
                    break;
                }
                else {
                    this.pos++;
                }
            }
        };
        CMDHistory.prototype.backward = function () {
            while (this.pos > 0) {
                if (this.cmdList[this.pos] != this.cmdList[this.pos - 1]) {
                    this.pos--;
                    break;
                }
                else {
                    this.pos--;
                }
            }
        };
        CMDHistory.prototype.getCMD = function () {
            return this.cmdList[this.pos];
        };
        CMDHistory.prototype.resetPos = function () {
            this.pos = this.cmdList.length - 1;
        };
        return CMDHistory;
    }());
})(TSOS || (TSOS = {}));
