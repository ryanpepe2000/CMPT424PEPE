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
            this.initMemory();
            TSOS.Control.initMemoryDisplay();
        };
        // Initial setting of memory
        Memory.prototype.initMemory = function () {
            for (var i = 0; i < this.memory.length; i++) {
                this.memory[i] = "00";
            }
        };
        // Used to reset the values of every bit in memory
        Memory.prototype.resetMemory = function () {
            for (var i = 0; i < _Memory.memory.length; i++) {
                _Memory.setMemory(i, "00");
            }
        };
        // Methods to be used by memory accessor
        Memory.prototype.getMemory = function (address) {
            return this.memory[TSOS.Utils.removePad(address)];
        };
        Memory.prototype.setMemory = function (address, val) {
            try {
                this.memory[TSOS.Utils.decToHex(address)] = val;
            }
            catch (e) {
                _Kernel.krnTrace("Unable to set memory address " + address + " to " + val);
                return false;
            }
            return true;
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
