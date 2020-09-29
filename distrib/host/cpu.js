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
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting, instructionList) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (instructionList === void 0) { instructionList = new Array(11); }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.instructionList = instructionList;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            // Populate Instruction Array
            this.instructionList[0] = (new Instruction("A9", "LDA", 2, Instruction.loadAccConstant));
            this.instructionList[1] = (new Instruction("AD", "LDA", 3, Instruction.loadAccMemory));
            this.instructionList[2] = (new Instruction("8D", "STA", 3, Instruction.storeAcc));
            this.instructionList[3] = (new Instruction("6D", "ADC", 3, Instruction.addWithCarry));
            this.instructionList[4] = (new Instruction("A2", "LDX", 2, Instruction.loadXConstant));
            this.instructionList[5] = (new Instruction("AE", "LDX", 3, Instruction.loadXMemory));
            this.instructionList[6] = (new Instruction("A0", "LDY", 2, Instruction.loadYConstant));
            this.instructionList[7] = (new Instruction("AC", "LDY", 3, Instruction.loadYMemory));
            this.instructionList[8] = (new Instruction("EA", "NOP", 1, Instruction.noOperation));
            this.instructionList[9] = (new Instruction("00", "BRK", 1, Instruction["break"]));
            this.instructionList[10] = (new Instruction("EC", "CPX", 3, Instruction.compareXReg));
            this.instructionList[11] = (new Instruction("D0", "BNE", 2, Instruction.branchBytes));
            this.instructionList[12] = (new Instruction("EE", "INC", 3, Instruction.incrementValue));
            this.instructionList[13] = (new Instruction("FF", "SYS", 1, Instruction.systemCall));
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.execute();
            if (_SingleStep) {
                this.isExecuting = false;
            }
            TSOS.Control.highlightMemoryDisplay();
        };
        Cpu.prototype.execute = function () {
            for (var _i = 0, _a = _ProcessManager.getProcessList(); _i < _a.length; _i++) {
                var pcb = _a[_i];
                if (pcb.state === "Executing") {
                    var instruction = this.getInstruction(_MemoryAccessor.readByte(TSOS.Utils.decToHex(this.PC)));
                    this.runInstruction(instruction, pcb);
                    this.updatePCB(pcb);
                }
            }
        };
        Cpu.prototype.runInstruction = function (instruction, pcb) {
            var pcInc = instruction.getPCInc();
            instruction.getCallback()([
                _MemoryAccessor.readByte(TSOS.Utils.decToHex(this.PC + 1)),
                _MemoryAccessor.readByte(TSOS.Utils.decToHex(this.PC + 2)) // The following item in memory
            ]);
            if (instruction.getMneumonic() === "BRK") {
                pcb.setState("Finished");
            }
            _CPU.addPc(pcInc);
        };
        Cpu.prototype.getInstruction = function (opCode) {
            for (var i = 0; i < this.instructionList.length; i++) {
                if (this.instructionList[i].getOpCode() === opCode) {
                    return this.instructionList[i];
                }
            }
        };
        Cpu.prototype.startProcess = function (pcb) {
            pcb.setState("Executing");
            this.PC = pcb.pc;
            this.Acc = pcb.acc;
            this.Xreg = pcb.xReg;
            this.Yreg = pcb.yReg;
            this.Zflag = pcb.zFlag;
            if (!_SingleStep) {
                this.isExecuting = true;
            }
        };
        Cpu.prototype.updatePCB = function (pcb) {
            pcb.setPC(this.PC);
            pcb.setAcc(this.Acc);
            pcb.setXReg(this.Xreg);
            pcb.setYReg(this.Yreg);
            pcb.setZFlag(this.Zflag);
        };
        Cpu.prototype.getPC = function () {
            return this.PC;
        };
        Cpu.prototype.addPc = function (amount) {
            this.PC += amount;
            if (this.PC > MEMORY_LENGTH) {
                this.PC = (this.PC % MEMORY_LENGTH);
            }
        };
        Cpu.prototype.getAcc = function () {
            return this.Acc;
        };
        Cpu.prototype.setAcc = function (num) {
            this.Acc = num;
        };
        Cpu.prototype.getXReg = function () {
            return this.Xreg;
        };
        Cpu.prototype.setXReg = function (num) {
            this.Xreg = num;
        };
        Cpu.prototype.getYReg = function () {
            return this.Yreg;
        };
        Cpu.prototype.setYReg = function (num) {
            this.Yreg = num;
        };
        Cpu.prototype.getZFlag = function () {
            return this.Zflag;
        };
        Cpu.prototype.enableZFlag = function () {
            this.Zflag = 1;
        };
        Cpu.prototype.disableZFlag = function () {
            this.Zflag = 0;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
    var Instruction = /** @class */ (function () {
        function Instruction(opCode, mneumonic, pcIncrement, callback) {
            this.opCode = opCode;
            this.mneumonic = mneumonic;
            this.pcIncrement = pcIncrement;
            this.callback = callback;
        }
        Instruction.prototype.getOpCode = function () {
            return this.opCode;
        };
        Instruction.prototype.getMneumonic = function () {
            return this.mneumonic;
        };
        Instruction.prototype.getPCInc = function () {
            return this.pcIncrement;
        };
        Instruction.prototype.getCallback = function () {
            return this.callback;
        };
        // Static methods used for OP Codes instructions
        Instruction.loadAccConstant = function (params) {
            _CPU.setAcc(TSOS.Utils.hexToDec(params[0]));
        };
        Instruction.loadAccMemory = function (params) {
            var address = params[1] + params[0];
            _CPU.setAcc(TSOS.Utils.hexToDec(_MemoryAccessor.readByte(address)));
        };
        Instruction.storeAcc = function (params) {
            var address = params[1] + params[0];
            var val = TSOS.Utils.decToHex(_CPU.getAcc());
            if (val === "0")
                val = "00";
            _MemoryAccessor.writeByte(TSOS.Utils.hexToDec(address), val);
        };
        Instruction.addWithCarry = function (params) {
            var address = params[1] + params[0];
            _CPU.setAcc(_CPU.getAcc() + TSOS.Utils.hexToDec(_MemoryAccessor.readByte(address)));
        };
        Instruction.loadXConstant = function (params) {
            _CPU.setXReg(TSOS.Utils.hexToDec(params[0]));
        };
        Instruction.loadXMemory = function (params) {
            var address = params[1] + params[0];
            _CPU.setXReg(TSOS.Utils.hexToDec(_MemoryAccessor.readByte(address)));
        };
        Instruction.loadYConstant = function (params) {
            _CPU.setYReg(TSOS.Utils.hexToDec(params[0]));
        };
        Instruction.loadYMemory = function (params) {
            var address = params[1] + params[0];
            _CPU.setYReg(TSOS.Utils.hexToDec(_MemoryAccessor.readByte(address)));
        };
        Instruction.noOperation = function () {
            return;
        };
        // Should be a system call
        Instruction["break"] = function () {
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(BREAK_PROCESS_IRQ, ["An error has occurred while processing user code"]));
            _MemoryManager.clearMemory();
        };
        Instruction.compareXReg = function (params) {
            var address = params[1] + params[0];
            TSOS.Utils.hexToDec(_MemoryAccessor.readByte(address)) === _CPU.getXReg() ?
                _CPU.enableZFlag() : _CPU.disableZFlag();
        };
        Instruction.branchBytes = function (params) {
            if (_CPU.getZFlag() === 0) {
                var numBytes = TSOS.Utils.hexToDec(params[0]);
                _CPU.addPc(numBytes);
            }
        };
        Instruction.incrementValue = function (params) {
            var address = params[1] + params[0];
            if (_MemoryAccessor.readByte(address).toUpperCase() === "FF")
                return;
            _MemoryAccessor.writeByte(TSOS.Utils.hexToDec(address), TSOS.Utils.decToHex(TSOS.Utils.hexToDec(_MemoryAccessor.readByte(address)) + 0x1).toUpperCase());
        };
        Instruction.systemCall = function () {
            var retVal = "";
            if (_CPU.getXReg() === 1) {
                retVal += _CPU.getYReg();
            }
            else if (_CPU.getXReg() === 2) {
                var index = _CPU.getYReg();
                var val = _MemoryAccessor.readByte(TSOS.Utils.decToHex(index));
                while (val !== "0" && val !== "00") {
                    retVal += String.fromCharCode(TSOS.Utils.hexToDec(val));
                    val = _MemoryAccessor.readByte(TSOS.Utils.decToHex(++index));
                }
            }
            else {
                return;
            }
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PRINT_PROCESS_IRQ, [retVal]));
        };
        return Instruction;
    }());
    TSOS.Instruction = Instruction;
})(TSOS || (TSOS = {}));
