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
        function ProcessManager(processes, readyQueue, terminatedList) {
            if (processes === void 0) { processes = new Array(); }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue(); }
            if (terminatedList === void 0) { terminatedList = new Array(); }
            this.processes = processes;
            this.readyQueue = readyQueue;
            this.terminatedList = terminatedList;
        }
        ProcessManager.prototype.getProcessList = function () {
            return this.processes;
        };
        ProcessManager.prototype.getReadyQueue = function () {
            return this.readyQueue;
        };
        ProcessManager.prototype.createProcess = function (segment) {
            var pcb = new ProcessControlBlock(this.getNextPID(), segment);
            this.processes[this.processes.length] = pcb;
            return pcb;
        };
        ProcessManager.prototype.getRunning = function () {
            for (var _i = 0, _a = this.getProcessList(); _i < _a.length; _i++) {
                var pcb = _a[_i];
                if (pcb.getState() === "Running") {
                    return pcb;
                }
            }
        };
        ProcessManager.prototype.getPCB = function (pid) {
            return this.processes[pid];
        };
        ProcessManager.prototype.getNextPID = function () {
            var next = -1;
            for (var i = 0; i < this.processes.length; i++) {
                if (this.processes[i] != null && this.processes[i].pid > next) {
                    next = this.processes[i].pid;
                }
            }
            return next + 1;
        };
        return ProcessManager;
    }());
    TSOS.ProcessManager = ProcessManager;
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(pid, segment, pc, acc, xReg, yReg, zFlag, state, waitingTime, turnaroundTime) {
            if (pc === void 0) { pc = 0; }
            if (acc === void 0) { acc = 0; }
            if (xReg === void 0) { xReg = 0; }
            if (yReg === void 0) { yReg = 0; }
            if (zFlag === void 0) { zFlag = 0; }
            if (state === void 0) { state = "New"; }
            if (waitingTime === void 0) { waitingTime = 0; }
            if (turnaroundTime === void 0) { turnaroundTime = 0; }
            this.pid = pid;
            this.segment = segment;
            this.pc = pc;
            this.acc = acc;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
            this.state = state;
            this.waitingTime = waitingTime;
            this.turnaroundTime = turnaroundTime;
        }
        ProcessControlBlock.prototype.getPID = function () {
            return this.pid;
        };
        ProcessControlBlock.prototype.getPC = function () {
            return this.pc;
        };
        ProcessControlBlock.prototype.setPC = function (num) {
            this.pc = num;
        };
        ProcessControlBlock.prototype.addPC = function (amount) {
            this.pc += amount;
            if (this.pc > MEMORY_LENGTH) {
                this.pc = this.pc % MEMORY_LENGTH;
            }
        };
        ProcessControlBlock.prototype.getAcc = function () {
            return this.acc;
        };
        ProcessControlBlock.prototype.setAcc = function (num) {
            this.acc = num;
        };
        ProcessControlBlock.prototype.getXReg = function () {
            return this.xReg;
        };
        ProcessControlBlock.prototype.setXReg = function (num) {
            this.xReg = num;
        };
        ProcessControlBlock.prototype.getYReg = function () {
            return this.yReg;
        };
        ProcessControlBlock.prototype.setYReg = function (num) {
            this.yReg = num;
        };
        ProcessControlBlock.prototype.getZFlag = function () {
            return this.zFlag;
        };
        ProcessControlBlock.prototype.setZFlag = function (num) {
            this.zFlag = num;
        };
        ProcessControlBlock.prototype.enableZFlag = function () {
            this.zFlag = 1;
        };
        ProcessControlBlock.prototype.disableZFlag = function () {
            this.zFlag = 0;
        };
        ProcessControlBlock.prototype.getState = function () {
            return this.state;
        };
        ProcessControlBlock.prototype.setState = function (state) {
            this.state = state;
            return this;
        };
        ProcessControlBlock.prototype.getSegment = function () {
            return this.segment;
        };
        ProcessControlBlock.prototype.incrementTime = function () {
            if (this.getState() === "Running") {
                this.turnaroundTime++;
            }
            else if (this.getState() === "Ready") {
                this.waitingTime++;
                this.turnaroundTime++;
            }
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
