/* ------------
     memoryManager.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
            this.availableSegments = new Array(MEMORY_BLOCKS);
            for (var i = 0; i < MEMORY_BLOCKS; i++) {
                this.availableSegments[i] = true;
            }
        }
        // Returns true if a memory segment is available (all memory is untaken)
        MemoryManager.prototype.memoryAvailable = function () {
            return this.availableSegments.indexOf(true) > -1;
        };
        MemoryManager.prototype.segmentAvailable = function (segment) {
            return this.availableSegments[segment];
        };
        MemoryManager.prototype.getAvailableSegment = function () {
            return this.availableSegments.indexOf(true);
        };
        MemoryManager.prototype.translateAddress = function (address, segment) {
            return ((segment * MEMORY_LENGTH) + address);
        };
        MemoryManager.prototype.fillSegment = function (segment, userCode) {
            this.availableSegments[segment] = false;
            // Write bytes to proper memory block
            for (var i = 0; i < userCode.length - 1; i += 0x1) {
                _MemoryAccessor.writeByte(_MMU.translateAddress(i, segment), userCode[i]);
            }
        };
        MemoryManager.prototype.emptySegment = function (segment) {
            this.availableSegments[segment] = true;
        };
        MemoryManager.prototype.getSegmentBounds = function (segment) {
            if (segment == 0) {
                return [0, MEMORY_LENGTH - 1];
            }
            else if (segment == 1) {
                return [MEMORY_LENGTH, (MEMORY_LENGTH * 2) - 1];
            }
            else if (segment == 2) {
                return [(MEMORY_LENGTH * 2), (MEMORY_LENGTH * 3) - 1];
            }
        };
        MemoryManager.prototype.getSegment = function (address) {
            for (var i = 0; i < this.availableSegments.length; i++) {
                var bounds = this.getSegmentBounds(i);
                if (address >= bounds[0] && address < bounds[1]) {
                    return i;
                }
            }
            return -1;
        };
        MemoryManager.prototype.getLogicalAddress = function (address) {
            var segment = this.getSegment(address);
            return this.translateAddress(address, segment);
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
