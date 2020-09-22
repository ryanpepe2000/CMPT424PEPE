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
        return InstructionFunction;
    }());
    TSOS.InstructionFunction = InstructionFunction;
})(TSOS || (TSOS = {}));
