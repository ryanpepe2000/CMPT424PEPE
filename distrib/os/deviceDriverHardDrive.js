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
            }
            // We must create an entry in filenameDict
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["File already exists."]));
            }
        };
        DeviceDriverHardDrive.prototype.readFile = function (params) {
        };
        DeviceDriverHardDrive.prototype.writeFile = function (params) {
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
                _HardDriveManager.cascadeUnset(fileTSB, _HardDriveManager.getHead(parseInt(fileTSB.charAt(0)), parseInt(fileTSB.charAt(1)), parseInt(fileTSB.charAt(2))));
            }
            // We must create an entry in filenameDict
            else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(DISK_OPERATION_ERROR_IRQ, ["File could not be found."]));
            }
        };
        DeviceDriverHardDrive.prototype.format = function (params) {
            _HardDriveManager.filenameDict = {};
            _HardDriveManager.init();
        };
        DeviceDriverHardDrive.prototype.listFiles = function (params) {
        };
        return DeviceDriverHardDrive;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverHardDrive = DeviceDriverHardDrive;
})(TSOS || (TSOS = {}));
