var TSOS;
(function (TSOS) {
    var InstructionList = /** @class */ (function () {
        function InstructionList() {
        }
        return InstructionList;
    }());
    TSOS.InstructionList = InstructionList;
    var Instruction = /** @class */ (function () {
        function Instruction(opCode, mneumonic, numParams, pcIncrement, callback) {
        }
        return Instruction;
    }());
    TSOS.Instruction = Instruction;
    var InstructionFunction = /** @class */ (function () {
        function InstructionFunction() {
        }
        InstructionFunction.loadAccConstant = function (params) {
            _CPU.setAcc(TSOS.Utils.hexToDec(params[0]));
        };
        InstructionFunction.loadAccMemory = function (params) {
            var address = params[1] + params[0];
            _CPU.setAcc(TSOS.Utils.hexToDec(_MemoryAccessor.readByte(address)));
        };
        InstructionFunction.addWithCarry = function (params) {
            var address = params[1] + params[0];
            _CPU.setAcc(_CPU.getAcc() + TSOS.Utils.hexToDec(_MemoryAccessor.readByte(address)));
        };
        InstructionFunction.loadXConstant = function (params) {
            _CPU.setXReg(TSOS.Utils.hexToDec(params[0]));
        };
        InstructionFunction.loadXMemory = function (params) {
            var address = params[1] + params[0];
            _CPU.setXReg(TSOS.Utils.hexToDec(_MemoryAccessor.readByte(address)));
        };
        InstructionFunction.loadYConstant = function (params) {
            _CPU.setYReg(TSOS.Utils.hexToDec(params[0]));
        };
        InstructionFunction.loadYMemory = function (params) {
            var address = params[1] + params[0];
            _CPU.setYReg(TSOS.Utils.hexToDec(_MemoryAccessor.readByte(address)));
        };
        InstructionFunction.noOperation = function () {
            return;
        };
        // Should be a system call
        InstructionFunction["break"] = function () {
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(BREAK_PROCESS_IRQ, ["An error has occurred while processing user code"]));
        };
        InstructionFunction.compareXReg = function (params) {
            var address = params[1] + params[0];
            TSOS.Utils.hexToDec(_MemoryAccessor.readByte(address)) === _CPU.getXReg() ?
                _CPU.enableZFlag() : _CPU.disableZFlag();
        };
        InstructionFunction.branchBytes = function (params) {
            var numBytes = TSOS.Utils.hexToDec(params[0]);
            _CPU.PC += numBytes;
            if (_CPU.PC > MEMORY_LENGTH) {
                _CPU.PC = _CPU.PC % MEMORY_LENGTH;
            }
        };
        InstructionFunction.incrementValue = function (params) {
            var address = params[1] + params[0];
            if (_MemoryAccessor.readByte(address).toUpperCase() === "FF")
                this["break"]();
            _MemoryAccessor.writeByte(TSOS.Utils.hexToDec(address), TSOS.Utils.decToHex(TSOS.Utils.hexToDec(_MemoryAccessor.readByte(address)) + 0x1).toUpperCase());
        };
        return InstructionFunction;
    }());
    TSOS.InstructionFunction = InstructionFunction;
})(TSOS || (TSOS = {}));
