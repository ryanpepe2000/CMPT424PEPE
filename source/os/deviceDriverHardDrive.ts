/* ----------------------------------
   DeviceDriverHardDrive.ts

   The Kernel Hard Drive Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverHardDrive extends DeviceDriver {
        // Initialize a dictionary with operations and respective service routines
        private OPERATIONS =  {
            "create" : this.createFile,
            "read" : this.readFile,
            "write" : this.writeFile,
            "delete" : this.deleteFile,
            "format" : this.format,
            "list" : this.listFiles
        };

        public isValidOperation(operation: string){
            return this.OPERATIONS[operation] !== undefined;
        }

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();

            this.driverEntry = this.krnHDDriverEntry;
            this.isr = this.krnHDDispatch;
        }

        public krnHDDriverEntry() {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
        }

        public krnHDDispatch(params: string[]) {
            // Get name of disk operation and remove it from param list
            let operation = params[0];
            params = params.slice(1);
            // Check validity of operation
            if (this.isValidOperation(operation)){
                // Run the specified operation
                this.OPERATIONS[operation](params);
            } else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["Invalid Disk Operation"]));
            }
        }

        public createFile(params): boolean {
            let dirKey = _HardDriveManager.findDir(params[0]);
            // Key does not exist in the filenameDict
            if (dirKey === null){
                // Set new key in dict
                dirKey = _HardDriveManager.getOpenDirKey();
                _HardDriveManager.filenameDict[params[0]] = dirKey;
                let dirTSB = _HardDriveManager.getTSB(dirKey);
                // Get next open file location and set it to in use
                let fileTSB = _HardDriveManager.getTSB(_HardDriveManager.getOpenFileKey());
                _HardDriveManager.setHead(fileTSB[0], fileTSB[1], fileTSB[2], "1000");
                // Write filename to directory entry
                _HardDriveManager.setHead(dirTSB[0], dirTSB[1], dirTSB[2], "1" + fileTSB.join(""));
                _HardDriveManager.setBody(dirTSB[0], dirTSB[1], dirTSB[2], params[0]);
                // Update MBR
                _HardDriveManager.updateOpenDirKey(_HardDriveManager.findOpenDirKey());
                _HardDriveManager.updateOpenFileKey(_HardDriveManager.findOpenFileKey());
                return true;
            }
            // We must create an entry in filenameDict
            else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["File already exists."]));
                return false;
            }
        }

        public readFile(params) {
            let buffer = "";
            let dirKey = _HardDriveManager.findDir(params[0]);
            // Key does not exist in the filenameDict
            if (dirKey !== null){
                let dirTSB = _HardDriveManager.getTSB(dirKey);
                let fileTSB = _HardDriveManager.getHead(dirTSB[0], dirTSB[1], dirTSB[2]).slice(1);
                let nextTSB = _HardDriveManager.getHead(parseInt(fileTSB.charAt(0)), parseInt(fileTSB.charAt(1)),
                    parseInt(fileTSB.charAt(2))).slice(1);
                do {
                    let fileText = _HardDriveManager.getBody(parseInt(fileTSB.charAt(0)), parseInt(fileTSB.charAt(1)),
                        parseInt(fileTSB.charAt(2)));
                    buffer += fileText;
                    nextTSB = _HardDriveManager.getHead(parseInt(nextTSB.charAt(0)), parseInt(nextTSB.charAt(1)),
                        parseInt(nextTSB.charAt(2))).slice(1);
                } while (nextTSB !== "000");
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_READ_OUTPUT_IRQ, buffer.split("")));
            }
            // We must create an entry in filenameDict
            else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["File could not be found."]));
            }
        }

        public writeFile(params): boolean {
            // Get Filename
            let filename = params[0];
            let dirKey = _HardDriveManager.findDir(filename);
            // File name exists in the directory
            if (dirKey !== null){
                // Collect the file text
                let fileText = "";
                let i = 1;
                while (params[i] !== undefined){
                    fileText += params[i] + " ";
                    i++;
                }
                // Remove white space on both sides of quotes
                fileText = fileText.replace(/((\s)+^)|(\s+$)/, "");
                // Valid file text was entered
                if (fileText.charAt(0) === '"' && fileText.charAt(fileText.length-1) === '"'){
                    fileText = fileText.substring(1, fileText.length - 1);
                    let dirTSB = _HardDriveManager.getTSB(dirKey);
                    let fileTSB = _HardDriveManager.getHead(dirTSB[0], dirTSB[1], dirTSB[2]).slice(1).split("");

                    // Reset all blocks associated with this file
                    let nextRef = _HardDriveManager.getHead(parseInt(fileTSB[0]), parseInt(fileTSB[1]), parseInt(fileTSB[2])).slice(1);
                    while (nextRef !== "000"){
                        // Get the TSB to be updated
                        let nextTSB = nextRef.split("");
                        // Get the reference of the referenced block
                        nextRef = _HardDriveManager.getHead(parseInt(nextTSB[0]), parseInt(nextTSB[1]), parseInt(nextTSB[2])).slice(1);
                        // Update the head of the current block
                        _HardDriveManager.setHead(parseInt(nextTSB[0]), parseInt(nextTSB[1]), parseInt(nextTSB[2]), "0000");
                    }
                    // Write the text to the file
                    _HardDriveManager.writeImmediate(parseInt(fileTSB[0]), parseInt(fileTSB[1]), parseInt(fileTSB[2]), fileText);
                    // Update MBR to reflect block usage
                    _HardDriveManager.updateOpenFileKey(_HardDriveManager.findOpenFileKey());
                    return true;
                }
                // Invalid parameters (text probably not surrounded with quotes)
                else {
                    _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["Invalid usage. Type 'help' for more details"]));
                    return false;
                }
            }
            // File name DNE in directory
            else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["File could not be found."]));
                return false;
            }
        }

        public deleteFile(params) {
            let dirKey = _HardDriveManager.findDir(params[0]);
            // Key does not exist in the filenameDict
            if (dirKey !== null){
                let dirTSB = _HardDriveManager.getTSB(dirKey);
                let fileTSB = _HardDriveManager.getHead(dirTSB[0], dirTSB[1], dirTSB[2]).slice(1);
                alert(fileTSB);
                // Set new key in dict
                delete _HardDriveManager.filenameDict[dirKey];
                _HardDriveManager.setHead(dirTSB[0], dirTSB[1], dirTSB[2], "0" + fileTSB);
                _HardDriveManager.updateOpenDirKey(_HardDriveManager.findOpenDirKey());
                _HardDriveManager.cascadeUnset(fileTSB, _HardDriveManager.getHead(parseInt(
                    fileTSB.charAt(0)), parseInt(fileTSB.charAt(1)), parseInt(fileTSB.charAt(2))));
            }
            // We must create an entry in filenameDict
            else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["File could not be found."]));
            }
        }

        public format(params) {
            let canFormat = true;
            if (canFormat){
                _HardDriveManager.filenameDict = {};
                _HardDriveManager.init();
            } else {
                _KernelInterruptQueue.enqueue(new Interrupt(DISK_OPERATION_ERROR_IRQ, ["Format could not be performed"]));
            }
        }

        public listFiles(params){

        }
    }
}
