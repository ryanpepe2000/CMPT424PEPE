/* ----------------------------------
   DeviceDriverHardDrive.ts

   The Kernel Hard Drive Device Driver.
   ---------------------------------- */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverHardDrive = /** @class */ (function (_super) {
        __extends(DeviceDriverHardDrive, _super);
        function DeviceDriverHardDrive() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            _super.call(this) || this;
            // Initialize a dictionary with operations and respective service routines
            _this.OPERATIONS = {
                "create": _this.createFile,
                "read": _this.readFile,
                "write": _this.writeFile,
                "delete": _this.deleteFile,
                "format": _this.format,
                "list": _this.listFiles
            };
            _this.driverEntry = _this.krnHDDriverEntry;
            _this.isr = _this.krnHDDispatch;
            return _this;
        }
        DeviceDriverHardDrive.prototype.isValidOperation = function (operation) {
            return this.OPERATIONS[operation] !== undefined;
        };
        DeviceDriverHardDrive.prototype.krnHDDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
        };
        DeviceDriverHardDrive.prototype.krnHDDispatch = function (params) {
            // Get name of disk operation and remove it from param list
            var operation = params[0];
            params = params.slice(1);
            // Check validity of operation
            if (this.isValidOperation(operation)) {
                // Run the specified operation
                this.OPERATIONS[operation](params);
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["Invalid Disk Operation"]));
            }
        };
        DeviceDriverHardDrive.prototype.createFile = function (params) {
            var dirKey = _HardDriveManager.findDir(params[0]);
            // Key does not exist in the filenameDict
            if (dirKey === null) {
                // Set new key in dict
                dirKey = _HardDriveManager.getOpenDirKey();
                _HardDriveManager.filenameDict[params[0]] = dirKey;
                var dirTSB = _HardDriveManager.getTSB(dirKey);
                // Get next open file location and set it to in use
                var fileTSB = _HardDriveManager.getTSB(_HardDriveManager.getOpenFileKey());
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
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["File already exists."]));
                return false;
            }
        };
        DeviceDriverHardDrive.prototype.readFile = function (params) {
            var buffer = "";
            var filename = params[0];
            if (filename.indexOf("~") === -1) {
                var dirKey = _HardDriveManager.findDir(params[0]);
                // Key does not exist in the filenameDict
                if (dirKey !== null) {
                    var dirTSB = _HardDriveManager.getTSB(dirKey);
                    var fileTSB = _HardDriveManager.getHead(dirTSB[0], dirTSB[1], dirTSB[2]).slice(1);
                    var nextTSB = _HardDriveManager.getHead(parseInt(fileTSB.charAt(0)), parseInt(fileTSB.charAt(1)), parseInt(fileTSB.charAt(2))).slice(1);
                    do {
                        var fileText = _HardDriveManager.getBody(parseInt(fileTSB.charAt(0)), parseInt(fileTSB.charAt(1)), parseInt(fileTSB.charAt(2)));
                        buffer += fileText;
                        nextTSB = _HardDriveManager.getHead(parseInt(nextTSB.charAt(0)), parseInt(nextTSB.charAt(1)), parseInt(nextTSB.charAt(2))).slice(1);
                    } while (nextTSB !== "000");
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_READ_OUTPUT_IRQ, buffer.split("")));
                }
                // We must create an entry in filenameDict
                else {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["File could not be found."]));
                }
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["Invalid character '~'."]));
            }
        };
        DeviceDriverHardDrive.prototype.writeFile = function (params) {
            // Get Filename
            var filename = params[0];
            var dirKey = _HardDriveManager.findDir(filename);
            // File name exists in the directory
            if (dirKey !== null) {
                // Collect the file text
                var fileText = "";
                var i = 1;
                while (params[i] !== undefined) {
                    fileText += params[i] + " ";
                    i++;
                }
                // Remove white space on both sides of quotes
                fileText = fileText.replace(/((\s)+^)|(\s+$)/, "");
                // Valid file text was entered
                if (fileText.charAt(0) === '"' && fileText.charAt(fileText.length - 1) === '"') {
                    fileText = fileText.substring(1, fileText.length - 1);
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
                    _HardDriveManager.writeImmediate(parseInt(fileTSB[0]), parseInt(fileTSB[1]), parseInt(fileTSB[2]), fileText);
                    // Update MBR to reflect block usage
                    _HardDriveManager.updateOpenFileKey(_HardDriveManager.findOpenFileKey());
                    return true;
                }
                // Invalid parameters (text probably not surrounded with quotes)
                else {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["Invalid usage. Type 'help' for more details"]));
                    return false;
                }
            }
            // File name DNE in directory
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["File could not be found."]));
                return false;
            }
        };
        DeviceDriverHardDrive.prototype.deleteFile = function (params) {
            var dirKey = _HardDriveManager.findDir(params[0]);
            // Key does not exist in the filenameDict
            if (dirKey !== null) {
                var dirTSB = _HardDriveManager.getTSB(dirKey);
                var fileTSB = _HardDriveManager.getHead(dirTSB[0], dirTSB[1], dirTSB[2]).slice(1);
                alert(fileTSB);
                // Set new key in dict
                delete _HardDriveManager.filenameDict[dirKey];
                _HardDriveManager.setHead(dirTSB[0], dirTSB[1], dirTSB[2], "0" + fileTSB);
                _HardDriveManager.updateOpenDirKey(_HardDriveManager.findOpenDirKey());
                _HardDriveManager.cascadeUnset(fileTSB, _HardDriveManager.getHead(parseInt(fileTSB.charAt(0)), parseInt(fileTSB.charAt(1)), parseInt(fileTSB.charAt(2))));
            }
            // We must create an entry in filenameDict
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["File could not be found."]));
            }
        };
        DeviceDriverHardDrive.prototype.format = function (params) {
            var canFormat = true;
            if (canFormat) {
                _HardDriveManager.filenameDict = {};
                _HardDriveManager.init();
            }
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["Format could not be performed"]));
            }
        };
        DeviceDriverHardDrive.prototype.listFiles = function (params) {
        };
        return DeviceDriverHardDrive;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverHardDrive = DeviceDriverHardDrive;
})(TSOS || (TSOS = {}));
