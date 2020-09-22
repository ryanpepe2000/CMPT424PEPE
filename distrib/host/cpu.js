/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        };
        Cpu.prototype.execute = function () {
        };
        Cpu.prototype.getAcc = function () {
            return this.Acc;
        };
        Cpu.prototype.setAcc = function (num) {
            this.Acc = num;
            // Move this elsewhere
            $("#cpu-acc").html(TSOS.Utils.decToHex(this.Acc).toUpperCase());
        };
        Cpu.prototype.getXReg = function () {
            return this.Xreg;
        };
        Cpu.prototype.setXReg = function (num) {
            this.Xreg = num;
            $("#cpu-x").html(TSOS.Utils.decToHex(this.Xreg).toUpperCase());
        };
        Cpu.prototype.getYReg = function () {
            return this.Yreg;
        };
        Cpu.prototype.setYReg = function (num) {
            this.Yreg = num;
            $("#cpu-y").html(TSOS.Utils.decToHex(this.Yreg).toUpperCase());
        };
        Cpu.prototype.getZFlag = function () {
            return this.Zflag;
        };
        Cpu.prototype.enableZFlag = function () {
            this.Zflag = 1;
            $("#cpu-z").html(TSOS.Utils.decToHex(this.Zflag));
        };
        Cpu.prototype.disableZFlag = function () {
            this.Zflag = 0;
            $("#cpu-z").html(TSOS.Utils.decToHex(this.Zflag));
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
