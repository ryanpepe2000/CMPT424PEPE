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
            if (processes === void 0) { processes = new Array(); }
            this.processes = processes;
        }
        ProcessManager.prototype.getProcessList = function () {
            return this.processes;
        };
        ProcessManager.prototype.createProcess = function () {
            var pcb = new ProcessControlBlock(this.getNextPID());
            this.processes[this.processes.length] = pcb;
            return pcb;
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
        function ProcessControlBlock(pid, pc, acc, xReg, yReg, zFlag, state) {
            if (pc === void 0) { pc = 0; }
            if (acc === void 0) { acc = 0; }
            if (xReg === void 0) { xReg = 0; }
            if (yReg === void 0) { yReg = 0; }
            if (zFlag === void 0) { zFlag = 0; }
            if (state === void 0) { state = "Waiting"; }
            this.pid = pid;
            this.pc = pc;
            this.acc = acc;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
            this.state = state;
        }
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
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
