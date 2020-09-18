/* ------------
     processManager.ts

     Contains definitions and initialization logic for processManager and ProcessControlBlock. The processManager
     is the overarching manager of processes, while the PCB is simply the ADT that stores relevant information
     about a process.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var ProcessManager = /** @class */ (function () {
        function ProcessManager(processes) {
            if (processes === void 0) { processes = new Array(0); }
            this.processes = processes;
        }
        ProcessManager.createProcess = function () {
            var PID = this.getMaxPID() + 1;
            this.processes[this.processes.length] = new ProcessControlBlock(PID);
            return PID;
        };
        ProcessManager.getMaxPID = function () {
            var max = -1;
            for (var i = 0; i < this.processes.length; i++) {
                if (this.processes[i] != null && this.processes[i].getPID() > max) {
                    max = this.processes[i].getPID();
                }
            }
            return max;
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(PID, PC, Acc, Xreg, Yreg, Zflag, state) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (state === void 0) { state = "Waiting"; }
            this.PID = PID;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.state = state;
        }
        ProcessControlBlock.prototype.getPID = function () {
            return this.PID;
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
