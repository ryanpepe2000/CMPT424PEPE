/* ------------
     scheduler.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler(quantum, counter) {
            if (quantum === void 0) { quantum = _Quantum; }
            if (counter === void 0) { counter = 0; }
            this.quantum = quantum;
            this.counter = counter;
        }
        Scheduler.prototype.runProcess = function (pcb) {
            // Admitted pcb will be added to the ready queue
            _ProcessManager.getReadyQueue().enqueue(pcb.setState("Ready"));
            // Replacing 'this.contextSwitch()' with KrnInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, [])) results
            // in invalid program execution. It appears private members of the cpu/pcb/scheduler are not updating accordingly
            // Temporarily using this.contextSwitch until a solution is found.
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, []));
            this.contextSwitch();
        };
        Scheduler.prototype.killProcess = function (pcb) {
            _ProcessManager.getRunning().setState("Terminated");
            if (_ProcessManager.getReadyQueue().getSize() >= 1) {
                this.contextSwitch();
            }
            else {
                _CPU.isExecuting = false;
            }
        };
        Scheduler.prototype.killAll = function () {
            _ProcessManager.getRunning().setState("Terminated");
            while (_ProcessManager.getReadyQueue().getSize() >= 1) {
                var pcb = _ProcessManager.getReadyQueue().dequeue();
                if (pcb != undefined) {
                    pcb.setState("Terminated");
                }
            }
            _CPU.isExecuting = false;
        };
        Scheduler.prototype.executeRoundRobin = function () {
            if (this.counter >= _Quantum) {
                if (_ProcessManager.getReadyQueue().getSize() >= 1) {
                    // Replacing 'this.contextSwitch()' with KrnInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, [])) results
                    // in invalid program execution. It appears private members of the cpu/pcb/scheduler are not updating accordingly
                    // Temporarily using this.contextSwitch until a solution is found.
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, []));
                    this.contextSwitch();
                }
                this.resetCounter();
            }
            _CPU.execute();
            this.counter++;
        };
        Scheduler.prototype.contextSwitch = function () {
            var currentPCB = _ProcessManager.getRunning();
            // Dequeue next PCB and dispatch for scheduling
            var nextPCB = _ProcessManager.getReadyQueue().dequeue();
            if (currentPCB == undefined) {
                nextPCB.setState("Running");
                _Scheduler.storeToCPU(nextPCB);
            }
            else {
                // Save current CPU context in pcb and switch contexts to the next in the ready queue
                _Scheduler.storeToPCB(currentPCB);
                _ProcessManager.getReadyQueue().enqueue(currentPCB.setState("Ready"));
                nextPCB.setState("Running");
                _Scheduler.storeToCPU(nextPCB);
            }
            return nextPCB;
        };
        Scheduler.prototype.storeToPCB = function (pcb) {
            // Save current CPU content to PCB
            pcb.pc = _CPU.PC;
            pcb.acc = _CPU.Acc;
            pcb.xReg = _CPU.Xreg;
            pcb.yReg = _CPU.Yreg;
            pcb.zFlag = _CPU.Zflag;
            pcb.segment = _CPU.segment;
        };
        Scheduler.prototype.storeToCPU = function (pcb) {
            // Save current PCB content to CPU
            _CPU.PC = pcb.pc;
            _CPU.Acc = pcb.acc;
            _CPU.Xreg = pcb.xReg;
            _CPU.Yreg = pcb.yReg;
            _CPU.Zflag = pcb.zFlag;
            _CPU.segment = pcb.segment;
        };
        Scheduler.prototype.resetCounter = function () {
            this.counter = 0;
        };
        Scheduler.prototype.updateQuantum = function () {
            this.resetCounter();
            this.quantum = _Quantum;
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
