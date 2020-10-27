/* ------------
     memoryAccessor.ts

     These methods are to be accessed directly from the CPU. Therefore, the current segment status of the CPU
     will be used to translate the logical byte address to to physical address.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.prototype.readByte = function (address) {
            return _Memory.getMemory(address);
        };
        MemoryAccessor.prototype.writeByte = function (address, value) {
            return _Memory.setMemory(address, value);
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
