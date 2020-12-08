/* ----------------------------------
   HardDrive.ts

   ---------------------------------- */
var TSOS;
(function (TSOS) {
    var HardDrive = /** @class */ (function () {
        function HardDrive() {
        }
        HardDrive.prototype.init = function (numTracks, numSectors, numBlocks, blockLength) {
            this.numTracks = numTracks;
            this.numSectors = numSectors;
            this.numBlocks = numBlocks;
            this.blockLength = blockLength;
        };
        /**
         * write
         *
         * Writes to HTML5 Session storage
         *
         * @param track
         * @param sector
         * @param block
         * @param value
         */
        HardDrive.prototype.write = function (track, sector, block, value) {
            var key = this.translateKey(track, sector, block);
            sessionStorage.setItem(key, value);
        };
        /**
         * read
         *
         * Reads from HTML5 Session Storage
         * @param track
         * @param sector
         * @param block
         */
        HardDrive.prototype.read = function (track, sector, block) {
            var key = this.translateKey(track, sector, block);
            return sessionStorage.getItem(key);
        };
        /**
         * translateKey
         *
         * Translates a track, sector, and block to the key format we will be using in the OS HardDrive
         * Ex: Track 5, Sector 2, Block 1 => "5:2:1"
         *
         * @param track
         * @param sector
         * @param block
         */
        HardDrive.prototype.translateKey = function (track, sector, block) {
            return track + ":" + sector + ":" + block;
        };
        HardDrive.prototype.getTracks = function () {
            return this.numTracks;
        };
        HardDrive.prototype.getSectors = function () {
            return this.numSectors;
        };
        HardDrive.prototype.getBlocks = function () {
            return this.numBlocks;
        };
        HardDrive.prototype.getBlockSize = function () {
            return this.blockLength;
        };
        return HardDrive;
    }());
    TSOS.HardDrive = HardDrive;
})(TSOS || (TSOS = {}));
