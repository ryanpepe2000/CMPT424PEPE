module TSOS {
    /**
     * HardDriveManager
     *
     * **NOTE**
     * This class functions only as a LOGICAL extension of the hard drive device driver
     * It contains helper functions and metadata necessary to perform disk operations.
     */
    export class HardDriveManager {
        // Initialize meta constants
        public readonly NUM_TRACKS = 4;
        public readonly NUM_SECTORS = 8;
        public readonly NUM_BLOCKS = 8;
        public readonly BLOCK_LENGTH = 64;
        public readonly HEADER_LENGTH = 4;
        public readonly BODY_LENGTH = this.BLOCK_LENGTH - this.HEADER_LENGTH;

        // Directory and File Storage Size
        public readonly DIR_TRACKS = 1;
        public readonly FILE_TRACKS = this.NUM_TRACKS - this.DIR_TRACKS;

        // Master Boot Record Constants
        public readonly MBR_NEXT_DIR_LOC = [0,3];
        public readonly MBR_NEXT_FILE_LOC = [3,6];

        // Hard Drive object to be used by the manager
        private hardDrive: HardDrive;


        // Logical dictionary mapping filenames to location keys
        public filenameDict: {} = {};

        /**
         * HardDriveManager Constructor
         *
         * Constructor for a hard drive manager. Links to the System's hard drive hardware
         * and acts as a layer between hardware (HardDrive) and OS (Control)
         *
         */
        constructor() {
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
        public init() {
            // Write zeros to the session storage
            for (let i = 0; i < this.hardDrive.getTracks(); i++){
                for (let j = 0; j < this.hardDrive.getSectors(); j++){
                    for (let k = 0; k < this.hardDrive.getBlocks(); k++){
                        // DO NOT use this.write() here or the Control will update the display i * j * k times
                        let value = Utils.asciiToDiskText("", this.hardDrive.getBlockSize());
                        this.hardDrive.write(i, j, k, value);
                    }
                }
            }
            this.setHead(0,0,0, "1000");
            this.setBody(0,0,0,"001100");
            // Updates the HD display with the newly initialized values
            Control.updateHDDisplay();
        }

        /**
         * Getters and Setters for Head/Body of Disk Entry
         */
        public setHead(track:number, sector:number, block:number, head:string): void {
            let diskEntry = this.read(track, sector, block);
            let body = diskEntry.slice(this.HEADER_LENGTH);
            let newEntry = head + body;
            this.write(track, sector, block, newEntry);
        }
        public getHead(track, sector, block): string {
            let diskEntry = this.read(track, sector, block);
            return diskEntry.slice(0, this.HEADER_LENGTH);
        }
        public setBody(track, sector, block, body): void {
            let diskEntry = this.read(track, sector, block);
            let head = diskEntry.slice(0, this.HEADER_LENGTH);
            let newEntry = head + body;
            this.write(track, sector, block, newEntry);
        }
        public getBody(track, sector, block): string {
            let diskEntry = this.read(track, sector, block);
            return diskEntry.slice(this.HEADER_LENGTH);
        }
        public getTSB(key: string): number[] {
            let tsb = key.split(":");
            return [parseInt(tsb[0]), parseInt(tsb[1]), parseInt(tsb[2])];
        }

        /**
         * Getters / Setters for MBR meta info
         */
        public getOpenDirKey(): string {
            // Get MBR content
            let content = this.getBody(0,0,0);
            return content.slice(this.MBR_NEXT_DIR_LOC[0], this.MBR_NEXT_DIR_LOC[1]).split("").join(":");
        }
        public updateOpenDirKey(dirKey: string): string {
            dirKey = dirKey.split(":").join("");
            let diskEntry = this.getBody(0,0,0);
            let end = diskEntry.slice(this.MBR_NEXT_DIR_LOC[1]);
            diskEntry = dirKey + end;
            this.setBody(0,0,0, diskEntry);
            return dirKey;
        }
        public getOpenFileKey(): string {
            // Get MBR content
            let content = this.getBody(0,0,0);
            return content.slice(this.MBR_NEXT_FILE_LOC[0], this.MBR_NEXT_FILE_LOC[1]).split("").join(":");
        }
        public updateOpenFileKey(fileKey: string): string {
            fileKey = fileKey.split(":").join("");
            let diskEntry = this.getBody(0,0,0);
            let start = diskEntry.slice(0, this.MBR_NEXT_DIR_LOC[1]);
            let end = diskEntry.slice(this.MBR_NEXT_FILE_LOC[1]);
            diskEntry = start + fileKey + end;
            this.setBody(0,0,0, diskEntry);
            return fileKey;
        }

        /**
         * findOpenDir
         *
         * Search through directory to find the next open location for a filename
         */
        public findOpenDirKey(): string {
            for (let i = 0; i < this.DIR_TRACKS; i++){
                for (let j = 0; j < this.NUM_SECTORS; j++){
                    for (let k = 0; k < this.NUM_BLOCKS; k++){
                        let head = this.getHead(i,j,k);
                        if (head.charAt(0) === "0" || head === ""){ // Might be able to remove second part
                            return i + ":" + j + ":" + k;
                        }
                    }
                }
            }
        }

        /**
         * findOpenFile
         *
         * Search through directory to find the next open location for a file
         */
        public findOpenFileKey(): string {
            for (let i = this.DIR_TRACKS; i < this.FILE_TRACKS; i++){
                for (let j = 0; j < this.NUM_SECTORS; j++){
                    for (let k = 0; k < this.NUM_BLOCKS; k++){
                        let head = this.getHead(i,j,k);
                        if (head.charAt(0) === "0" || head === ""){ // Might be able to remove second part
                            return i + ":" + j + ":" + k;
                        }
                    }
                }
            }
        }

        /**
         * write
         *
         * Calls the hard drives built-in write method
         */
        public write(track: number, sector: number, block: number, value:string): void {
            let formattedHex = Utils.asciiToDiskText(value, this.hardDrive.getBlockSize());
            this.hardDrive.write(track, sector, block, formattedHex);
            // Update the memory display whenever something is being written
            Control.updateHDDisplay();
        }

        /**
         * File Auxiliary Methods
         */
        public createFile(filename: string): void {
            let dirKey = _HardDriveManager.findDir(filename);
            // We must create an entry in filenameDict
            if (dirKey === null){
                // Set new key in dict
                dirKey = _HardDriveManager.getOpenDirKey();
                _HardDriveManager.filenameDict[filename] = dirKey;
                let dirTSB = _HardDriveManager.getTSB(dirKey);
                // Get next open file location and set it to in use
                let fileTSB = _HardDriveManager.getTSB(_HardDriveManager.getOpenFileKey());
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
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["File already exists."]));
            }
        }

        public readFile(filename: string): string {
            let buffer = "";
            let dirKey = _HardDriveManager.findDir(filename);
            // File exists on the disk
            if (dirKey !== null){
                let dirTSB = _HardDriveManager.getTSB(dirKey);
                let fileTSB = _HardDriveManager.getHead(dirTSB[0], dirTSB[1], dirTSB[2]).slice(1);
                let loop = true;
                while (loop){
                    let fileText = _HardDriveManager.getBody(parseInt(fileTSB.charAt(0)), parseInt(fileTSB.charAt(1)),
                        parseInt(fileTSB.charAt(2)));
                    buffer += fileText;
                    fileTSB = _HardDriveManager.getHead(parseInt(fileTSB.charAt(0)), parseInt(fileTSB.charAt(1)),
                        parseInt(fileTSB.charAt(2))).slice(1);
                    loop = fileTSB !== "000";
                }
                return buffer;
            } else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["File not found."]));
            }
        }

        public writeFile(filename: string, text: string): void {
            // Get key in directory
            let dirKey = _HardDriveManager.findDir(filename);
            // File name exists in the directory
            if (dirKey !== null) {
                //Get TSB of
                let dirTSB = _HardDriveManager.getTSB(dirKey);
                let fileTSB = _HardDriveManager.getHead(dirTSB[0], dirTSB[1], dirTSB[2]).slice(1).split("");

                // Reset all blocks associated with this file
                let nextRef = _HardDriveManager.getHead(parseInt(fileTSB[0]), parseInt(fileTSB[1]), parseInt(fileTSB[2])).slice(1);
                while (nextRef !== "000") {
                    // Get the TSB to be updated
                    let nextTSB = nextRef.split("");
                    // Get the reference of the referenced block
                    nextRef = _HardDriveManager.getHead(parseInt(nextTSB[0]), parseInt(nextTSB[1]), parseInt(nextTSB[2])).slice(1);
                    // Update the head of the current block
                    _HardDriveManager.setHead(parseInt(nextTSB[0]), parseInt(nextTSB[1]), parseInt(nextTSB[2]), "0000");
                }

                // Update MBR to reflect block usage
                this.updateOpenFileKey(this.findOpenFileKey());
                // Set the next unopened spot to in use
                let nextTSB = this.getOpenFileKey().split(":");

                while (text.length > this.BODY_LENGTH){
                    // Cut the text
                    let shortText = text.slice(0, this.BODY_LENGTH);
                    text = text.substr(this.BODY_LENGTH);
                    _HardDriveManager.setHead(parseInt(fileTSB[0]), parseInt(fileTSB[1]), parseInt(fileTSB[2]), "1" + nextTSB.join(""));
                    _HardDriveManager.setBody(parseInt(fileTSB[0]), parseInt(fileTSB[1]), parseInt(fileTSB[2]), shortText);
                    // Refresh to MBR
                    fileTSB = nextTSB;
                    _HardDriveManager.setHead(parseInt(nextTSB[0]), parseInt(nextTSB[1]), parseInt(nextTSB[2]), "1000");
                    this.updateOpenFileKey(this.findOpenFileKey());
                    nextTSB = this.getOpenFileKey().split(":");

                }
                _HardDriveManager.setHead(parseInt(fileTSB[0]), parseInt(fileTSB[1]), parseInt(fileTSB[2]), "1000");
                _HardDriveManager.setBody(parseInt(fileTSB[0]), parseInt(fileTSB[1]), parseInt(fileTSB[2]), text);

                // Update MBR to reflect block usage
                _HardDriveManager.updateOpenFileKey(_HardDriveManager.findOpenFileKey());
            }
        }

        public deleteFile(filename: string){
            let dirKey = _HardDriveManager.findDir(filename);
            // Key does not exist in the filenameDict
            if (dirKey !== null){
                let dirTSB = _HardDriveManager.getTSB(dirKey);
                let fileTSB = _HardDriveManager.getHead(dirTSB[0], dirTSB[1], dirTSB[2]).slice(1);
                // Set new key in dict
                delete _HardDriveManager.filenameDict[filename];
                _HardDriveManager.setHead(dirTSB[0], dirTSB[1], dirTSB[2], "0" + fileTSB);
                _HardDriveManager.cascadeUnset(fileTSB, _HardDriveManager.getHead(parseInt(
                    fileTSB.charAt(0)), parseInt(fileTSB.charAt(1)), parseInt(fileTSB.charAt(2))));
                // Update MBR
                _HardDriveManager.updateOpenDirKey(_HardDriveManager.findOpenDirKey());
                _HardDriveManager.updateOpenFileKey(_HardDriveManager.findOpenFileKey());
            }
            // We must create an entry in filenameDict
            else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["File could not be found."]));
            }
        }


        /**
         * read
         *
         * Calls the hard drives built-in read method
         */
        public read(track: number, sector: number, block: number): string {
            // Convert disk-formatted hexadecimal to the ascii code
            return Utils.diskTextToAscii(this.hardDrive.read(track, sector, block).replace(/(00)+$/, ""));
        }

        /**
         * readNoFormat
         *
         * To be used by the Control. Allows for custom Ascii / Hex encoding
         */
        public readNoFormat(track: number, sector: number, block: number): string {
            // Convert disk-formatted hexadecimal to the ascii code
            return this.hardDrive.read(track, sector, block);
        }
        /**
         * getTracks
         */
        public getTracks(): number {
            return this.hardDrive.getTracks();
        }

        /**
         * getSectors
         */
        public getSectors(): number {
            return this.hardDrive.getSectors();
        }

        /**
         * getBlocks
         */
        public getBlocks(): number {
            return this.hardDrive.getBlocks();
        }

        /**
         * getBlockSize
         */
        public getBlockSize(): number {
            return this.hardDrive.getBlockSize();
        }

        /**
         * findDir
         *
         * Searches for directory name in map and returns the key of that location
         *
         * @param filename
         */
        public findDir(filename: string): string {
            let key = this.filenameDict[filename];
            if (key === undefined){
                return null;
            } else {
                return key;
            }
        }

        /**
         * cascadeUnset
         *
         * Auxilary function. Unsets the "inUse" flag on all disk entries and their
         * following entries in the linked list.
         *
         * @param diskEntryTSB
         * @param diskEntryHead
         */
        public cascadeUnset(diskEntryTSB: string, diskEntryHead: string){
            let thisTSB = diskEntryTSB.split("");
            let nextTSB = diskEntryHead.slice(1);
            let tsb = nextTSB.split("");
            if (nextTSB === "000"){
                _HardDriveManager.setHead(parseInt(thisTSB[0]),parseInt(thisTSB[1]),parseInt(thisTSB[2]), "0" + nextTSB);
                return;
            } else {
                _HardDriveManager.setHead(parseInt(thisTSB[0]),parseInt(thisTSB[1]),parseInt(thisTSB[2]), "0" + nextTSB);
                this.cascadeUnset(nextTSB, _HardDriveManager.getHead(parseInt(tsb[0]),parseInt(tsb[1]),parseInt(tsb[2])));
            }
        }

        public getFilename(pcb: ProcessControlBlock){
            return "process-" + pcb.getPID() + ".~swp";
        }
    }
}