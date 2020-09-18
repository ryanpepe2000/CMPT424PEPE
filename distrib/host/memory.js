/* ------------
     memory.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            this.memory = new Array(MEMORY_LENGTH);
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < this.memory.length; i++) {
                this.memory[i] = "00";
            }
        };
        Memory.prototype.getMemory = function (address) {
            return this.memory[TSOS.Utils.hexToDec(address)];
        };
        Memory.prototype.setMemory = function (address, val) {
            try {
                this.memory[TSOS.Utils.hexToDec(address)] = val;
            }
            catch (e) {
                _Kernel.krnTrace("Unable to set memory address " + address + " to " + val);
                return false;
            }
            return true;
        };
        Memory.prototype.clearMemory = function () {
            for (var i = 0; i < this.memory.length; i++) {
                this.memory[i] = "00";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
