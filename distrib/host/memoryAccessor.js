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
            console.log("Reading byte from address: " + address);
            return _Memory.getMemory(address);
        };
        MemoryAccessor.prototype.writeByte = function (address, value) {
            console.log("Writing to byte: " + address);
            return _Memory.setMemory(address, value);
        };
        // Calls the reset memory in TSOS.Memory
        // Strange bug was preventing calling TSOS.Memory.clearMemory()
        MemoryAccessor.prototype.clearMemory = function () {
            _Memory.resetMemory();
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
