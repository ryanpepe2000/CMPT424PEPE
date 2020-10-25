/* ------------
     memoryManager.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
        }
        // Returns true if a memory segment is available (all memory is untaken)
        MemoryManager.memoryAvailable = function () {
            for (var i = 0; i < MEMORY_BLOCKS; i++) {
                if (MemoryManager.segmentAvailable(i))
                    return true;
            }
            return false;
        };
        MemoryManager.segmentAvailable = function (segment) {
            if (segment >= MEMORY_BLOCKS || segment < 0)
                return false;
            for (var i = (MEMORY_LENGTH * segment); i < (MEMORY_LENGTH * segment) + MEMORY_LENGTH - 1; i++) {
                if (_Memory.getMemory(i.toString(16)) !== "00")
                    return false;
            }
            return true;
        };
        MemoryManager.getAvailableSegment = function () {
            for (var i = 0; i < MEMORY_BLOCKS; i++) {
                if (this.segmentAvailable(i))
                    return i;
            }
            return -1;
        };
        MemoryManager.translateAddress = function (address, segment) {
            return ((segment * MEMORY_LENGTH) + address);
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
