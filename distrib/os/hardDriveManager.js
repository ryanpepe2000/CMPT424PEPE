var TSOS;
(function (TSOS) {
    /**
     * HardDriveManager
     *
     * **NOTE**
     * This class functions only as a LOGICAL extension of the hard drive device driver
     * It contains helper functions and metadata necessary to perform disk operations.
     */
    var HardDriveManager = /** @class */ (function () {
        /**
         * HardDriveManager Constructor
         *
         * Constructor for a hard drive manager. Links to the System's hard drive hardware
         * and acts as a layer between hardware (HardDrive) and OS (Control)
         *
         */
        function HardDriveManager() {
            // Initialize meta constants
            this.NUM_TRACKS = 4;
            this.NUM_SECTORS = 8;
            this.NUM_BLOCKS = 8;
            this.BLOCK_LENGTH = 64;
            this.HEADER_LENGTH = 4;
            this.BODY_LENGTH = this.BLOCK_LENGTH - this.HEADER_LENGTH;
            // Directory and File Storage Size
            this.DIR_TRACKS = 1;
            this.FILE_TRACKS = this.NUM_TRACKS - this.DIR_TRACKS;
            // Master Boot Record Constants
            this.MBR_NEXT_DIR_LOC = [0, 3];
            this.MBR_NEXT_FILE_LOC = [3, 6];
            // Logical dictionary mapping filenames to location keys
            this.filenameDict = {};
            // Initialize the hardDrive with proper lengths for TSB and block size
            this.hardDrive = _HardDrive;
            this.hardDrive.init(this.NUM_TRACKS, this.NUM_SECTORS, this.NUM_BLOCKS, this.BLOCK_LENGTH);
        }
        /**
         * init
         *
         * Initializes the Hard Drive and Hard Drive Manager
         *
         */
        HardDriveManager.prototype.init = function () {
            // Write zeros to the session storage
            for (var i = 0; i < this.hardDrive.getTracks(); i++) {
                for (var j = 0; j < this.hardDrive.getSectors(); j++) {
                    for (var k = 0; k < this.hardDrive.getBlocks(); k++) {
                        // DO NOT use this.write() here or the Control will update the display i * j * k times
                        var value = TSOS.Utils.asciiToDiskText("", this.hardDrive.getBlockSize());
                        this.hardDrive.write(i, j, k, value);
                    }
                }
            }
            this.setHead(0, 0, 0, "1000");
            this.setBody(0, 0, 0, "001100");
            // Updates the HD display with the newly initialized values
            TSOS.Control.updateHDDisplay();
        };
        /**
         * Getters and Setters for Head/Body of Disk Entry
         */
        HardDriveManager.prototype.setHead = function (track, sector, block, head) {
            var diskEntry = this.read(track, sector, block);
            var body = diskEntry.slice(this.HEADER_LENGTH);
            var newEntry = head + body;
            this.write(track, sector, block, newEntry);
        };
        HardDriveManager.prototype.getHead = function (track, sector, block) {
            var diskEntry = this.read(track, sector, block);
            return diskEntry.slice(0, this.HEADER_LENGTH);
        };
        HardDriveManager.prototype.setBody = function (track, sector, block, body) {
            var diskEntry = this.read(track, sector, block);
            var head = diskEntry.slice(0, this.HEADER_LENGTH);
            var newEntry = head + body;
            this.write(track, sector, block, newEntry);
        };
        HardDriveManager.prototype.getBody = function (track, sector, block) {
            var diskEntry = this.read(track, sector, block);
            return diskEntry.slice(this.HEADER_LENGTH);
        };
        HardDriveManager.prototype.getTSB = function (key) {
            var tsb = key.split(":");
            return [parseInt(tsb[0]), parseInt(tsb[1]), parseInt(tsb[2])];
        };
        /**
         * Getters / Setters for MBR meta info
         */
        HardDriveManager.prototype.getOpenDirKey = function () {
            // Get MBR content
            var content = this.getBody(0, 0, 0);
            return content.slice(this.MBR_NEXT_DIR_LOC[0], this.MBR_NEXT_DIR_LOC[1]).split("").join(":");
        };
        HardDriveManager.prototype.updateOpenDirKey = function (dirKey) {
            dirKey = dirKey.split(":").join("");
            var diskEntry = this.getBody(0, 0, 0);
            var end = diskEntry.slice(this.MBR_NEXT_DIR_LOC[1]);
            diskEntry = dirKey + end;
            this.setBody(0, 0, 0, diskEntry);
        };
        HardDriveManager.prototype.getOpenFileKey = function () {
            // Get MBR content
            var content = this.getBody(0, 0, 0);
            return content.slice(this.MBR_NEXT_FILE_LOC[0], this.MBR_NEXT_FILE_LOC[1]).split("").join(":");
        };
        HardDriveManager.prototype.updateOpenFileKey = function (fileKey) {
            fileKey = fileKey.split(":").join("");
            var diskEntry = this.getBody(0, 0, 0);
            var start = diskEntry.slice(0, this.MBR_NEXT_DIR_LOC[1]);
            var end = diskEntry.slice(this.MBR_NEXT_FILE_LOC[1]);
            diskEntry = start + fileKey + end;
            this.setBody(0, 0, 0, diskEntry);
        };
        /**
         * findOpenDir
         *
         * Search through directory to find the next open location for a filename
         */
        HardDriveManager.prototype.findOpenDirKey = function () {
            for (var i = 0; i < this.DIR_TRACKS; i++) {
                for (var j = 0; j < this.NUM_SECTORS; j++) {
                    for (var k = 0; k < this.NUM_BLOCKS; k++) {
                        var head = this.getHead(i, j, k);
                        if (head.charAt(0) === "0" || head === "") { // Might be able to remove second part
                            return i + ":" + j + ":" + k;
                        }
                    }
                }
            }
        };
        /**
         * findOpenFile
         *
         * Search through directory to find the next open location for a file
         */
        HardDriveManager.prototype.findOpenFileKey = function () {
            for (var i = this.DIR_TRACKS; i < this.FILE_TRACKS; i++) {
                for (var j = 0; j < this.NUM_SECTORS; j++) {
                    for (var k = 0; k < this.NUM_BLOCKS; k++) {
                        var head = this.getHead(i, j, k);
                        if (head.charAt(0) === "0" || head === "") { // Might be able to remove second part
                            return i + ":" + j + ":" + k;
                        }
                    }
                }
            }
        };
        /**
         * write
         *
         * Calls the hard drives built-in write method
         */
        HardDriveManager.prototype.write = function (track, sector, block, value) {
            var formattedHex = TSOS.Utils.asciiToDiskText(value, this.hardDrive.getBlockSize());
            this.hardDrive.write(track, sector, block, formattedHex);
            // Update the memory display whenever something is being written
            TSOS.Control.updateHDDisplay();
        };
        /**
         * writeImmediate
         *
         * Helper function to be used by device driver. Will directly write
         * text to a specified TSB and cascade writes as necessary. This
         * method will only be used if the device driver guarentees that a file should
         * be written with text
         *
         * @param track
         * @param sector
         * @param block
         * @param text
         */
        HardDriveManager.prototype.writeImmediate = function (track, sector, block, text) {
            // Write the text to blocks
            if (text.length > _HardDriveManager.BODY_LENGTH) {
                // Split the text into a usable size
                var thisText = text.slice(0, _HardDriveManager.BODY_LENGTH);
                var nextText = text.substr(_HardDriveManager.BODY_LENGTH);
                // Get the next available block
                var nextKey = _HardDriveManager.getOpenFileKey();
                var nextTSB = _HardDriveManager.getTSB(nextKey);
                // Write the first text to the current block
                _HardDriveManager.setHead(track, sector, block, "1" + nextKey.split(":").join(""));
                _HardDriveManager.setBody(track, sector, block, thisText);
                // Update MBR to reflect block usage
                _HardDriveManager.updateOpenFileKey(_HardDriveManager.findOpenFileKey());
                return this.writeImmediate(nextTSB[0], nextTSB[1], nextTSB[2], nextText);
            }
            else {
                _HardDriveManager.setHead(track, sector, block, "1000");
                _HardDriveManager.setBody(track, sector, block, text);
                return true;
            }
        };
        /**
         * File Auxiliary Methods
         */
        HardDriveManager.prototype.createFile = function (filename) {
            var dirKey = _HardDriveManager.findDir(filename);
            // We must create an entry in filenameDict
            if (dirKey === null) {
                // Set new key in dict
                dirKey = _HardDriveManager.getOpenDirKey();
                _HardDriveManager.filenameDict[filename] = dirKey;
                var dirTSB = _HardDriveManager.getTSB(dirKey);
                // Get next open file location and set it to in use
                var fileTSB = _HardDriveManager.getTSB(_HardDriveManager.getOpenFileKey());
                _HardDriveManager.setHead(fileTSB[0], fileTSB[1], fileTSB[2], "1000");
                _HardDriveManager.setBody(fileTSB[0], fileTSB[1], fileTSB[2], "");
                // Write filename to directory entry
                _HardDriveManager.setHead(dirTSB[0], dirTSB[1], dirTSB[2], "1" + fileTSB.join(""));
                _HardDriveManager.setBody(dirTSB[0], dirTSB[1], dirTSB[2], filename);
                // Update MBR
                _HardDriveManager.updateOpenDirKey(_HardDriveManager.findOpenDirKey());
                _HardDriveManager.updateOpenFileKey(_HardDriveManager.findOpenFileKey());
            }
            // Key exists in the filenameDict
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["File already exists."]));
            }
        };
        HardDriveManager.prototype.readFile = function (filename) {
            var buffer = "";
            var dirKey = _HardDriveManager.findDir(filename);
            // File exists on the disk
            if (dirKey !== null) {
                var dirTSB = _HardDriveManager.getTSB(dirKey);
                var fileTSB = _HardDriveManager.getHead(dirTSB[0], dirTSB[1], dirTSB[2]).slice(1);
                var nextTSB = _HardDriveManager.getHead(parseInt(fileTSB.charAt(0)), parseInt(fileTSB.charAt(1)), parseInt(fileTSB.charAt(2))).slice(1);
                do {
                    var fileText = _HardDriveManager.getBody(parseInt(fileTSB.charAt(0)), parseInt(fileTSB.charAt(1)), parseInt(fileTSB.charAt(2)));
                    buffer += fileText;
                    nextTSB = _HardDriveManager.getHead(parseInt(nextTSB.charAt(0)), parseInt(nextTSB.charAt(1)), parseInt(nextTSB.charAt(2))).slice(1);
                } while (nextTSB !== "000");
                return buffer;
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["File not found."]));
            }
        };
        HardDriveManager.prototype.writeFile = function (filename, text) {
            // Get key in directory
            var dirKey = _HardDriveManager.findDir(filename);
            // File name exists in the directory
            if (dirKey !== null) {
                //Get TSB of file
                var dirTSB = _HardDriveManager.getTSB(dirKey);
                var fileTSB = _HardDriveManager.getHead(dirTSB[0], dirTSB[1], dirTSB[2]).slice(1).split("");
                // Reset all blocks associated with this file
                var nextRef = _HardDriveManager.getHead(parseInt(fileTSB[0]), parseInt(fileTSB[1]), parseInt(fileTSB[2])).slice(1);
                while (nextRef !== "000") {
                    // Get the TSB to be updated
                    var nextTSB = nextRef.split("");
                    // Get the reference of the referenced block
                    nextRef = _HardDriveManager.getHead(parseInt(nextTSB[0]), parseInt(nextTSB[1]), parseInt(nextTSB[2])).slice(1);
                    // Update the head of the current block
                    _HardDriveManager.setHead(parseInt(nextTSB[0]), parseInt(nextTSB[1]), parseInt(nextTSB[2]), "0000");
                }
                // Write the text to the file
                _HardDriveManager.writeImmediate(parseInt(fileTSB[0]), parseInt(fileTSB[1]), parseInt(fileTSB[2]), text);
                // Update MBR to reflect block usage
                _HardDriveManager.updateOpenFileKey(_HardDriveManager.findOpenFileKey());
            }
        };
        HardDriveManager.prototype.deleteFile = function (filename) {
            var dirKey = _HardDriveManager.findDir(filename);
            // Key does not exist in the filenameDict
            if (dirKey !== null) {
                var dirTSB = _HardDriveManager.getTSB(dirKey);
                var fileTSB = _HardDriveManager.getHead(dirTSB[0], dirTSB[1], dirTSB[2]).slice(1);
                // Set new key in dict
                delete _HardDriveManager.filenameDict[filename];
                _HardDriveManager.setHead(dirTSB[0], dirTSB[1], dirTSB[2], "0" + fileTSB);
                _HardDriveManager.cascadeUnset(fileTSB, _HardDriveManager.getHead(parseInt(fileTSB.charAt(0)), parseInt(fileTSB.charAt(1)), parseInt(fileTSB.charAt(2))));
                // Update MBR
                _HardDriveManager.updateOpenDirKey(_HardDriveManager.findOpenDirKey());
                _HardDriveManager.updateOpenFileKey(_HardDriveManager.findOpenFileKey());
            }
            // We must create an entry in filenameDict
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["File could not be found."]));
            }
        };
        /**
         * read
         *
         * Calls the hard drives built-in read method
         */
        HardDriveManager.prototype.read = function (track, sector, block) {
            // Convert disk-formatted hexadecimal to the ascii code
            return TSOS.Utils.diskTextToAscii(this.hardDrive.read(track, sector, block).replace(/(00)+$/, ""));
        };
        /**
         * readNoFormat
         *
         * To be used by the Control. Allows for custom Ascii / Hex encoding
         */
        HardDriveManager.prototype.readNoFormat = function (track, sector, block) {
            // Convert disk-formatted hexadecimal to the ascii code
            return this.hardDrive.read(track, sector, block);
        };
        /**
         * getTracks
         */
        HardDriveManager.prototype.getTracks = function () {
            return this.hardDrive.getTracks();
        };
        /**
         * getSectors
         */
        HardDriveManager.prototype.getSectors = function () {
            return this.hardDrive.getSectors();
        };
        /**
         * getBlocks
         */
        HardDriveManager.prototype.getBlocks = function () {
            return this.hardDrive.getBlocks();
        };
        /**
         * getBlockSize
         */
        HardDriveManager.prototype.getBlockSize = function () {
            return this.hardDrive.getBlockSize();
        };
        /**
         * findDir
         *
         * Searches for directory name in map and returns the key of that location
         *
         * @param filename
         */
        HardDriveManager.prototype.findDir = function (filename) {
            var key = this.filenameDict[filename];
            if (key === undefined) {
                return null;
            }
            else {
                return key;
            }
        };
        /**
         * cascadeUnset
         *
         * Auxilary function. Unsets the "inUse" flag on all disk entries and their
         * following entries in the linked list.
         *
         * @param diskEntryTSB
         * @param diskEntryHead
         */
        HardDriveManager.prototype.cascadeUnset = function (diskEntryTSB, diskEntryHead) {
            var thisTSB = diskEntryTSB.split("");
            var nextTSB = diskEntryHead.slice(1);
            var tsb = nextTSB.split("");
            if (nextTSB === "000") {
                _HardDriveManager.setHead(parseInt(thisTSB[0]), parseInt(thisTSB[1]), parseInt(thisTSB[2]), "0" + nextTSB);
                return;
            }
            else {
                _HardDriveManager.setHead(parseInt(thisTSB[0]), parseInt(thisTSB[1]), parseInt(thisTSB[2]), "0" + nextTSB);
                this.cascadeUnset(nextTSB, _HardDriveManager.getHead(parseInt(tsb[0]), parseInt(tsb[1]), parseInt(tsb[2])));
            }
        };
        HardDriveManager.prototype.getFilename = function (pcb) {
            return "process-" + pcb.getPID() + ".~swp";
        };
        return HardDriveManager;
    }());
    TSOS.HardDriveManager = HardDriveManager;
})(TSOS || (TSOS = {}));
