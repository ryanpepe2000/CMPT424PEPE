/* ------------
     scheduler.ts

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Scheduler {
        constructor(private quantum: number = _Quantum,
                    private counter: number = 0) {
        }

        public runProcess(pcb: ProcessControlBlock){
            // Admitted pcb will be added to the ready queue
            _ProcessManager.getReadyQueue().enqueue(pcb.setState("Ready"));
            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, []));
        }

        public runAllProcesses(): boolean {
            let count = 0;
            for (let pcb of _ProcessManager.getProcessList()){
                if (pcb.getState() === "New"){
                    _ProcessManager.getReadyQueue().enqueue(pcb.setState("Ready"));
                    count++;
                }
            }
            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, []));
            return count > 0;
        }

        public killProcess(pcb: ProcessControlBlock){
            _ProcessManager.getRunning().setState("Terminated");
            if (_ProcessManager.getReadyQueue().getSize() >= 1){
                _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, []));
            } else {
                _CPU.isExecuting = false;
            }
        }

        public killAll(){
            _ProcessManager.getRunning().setState("Terminated");
            while (_ProcessManager.getReadyQueue().getSize() >= 1){
                let pcb: ProcessControlBlock = _ProcessManager.getReadyQueue().dequeue();
                if (pcb != undefined){
                    pcb.setState("Terminated");
                }
            }
            _CPU.isExecuting = false;
        }

        public executeRoundRobin(){
            if (this.counter >=_Quantum){
                if (_ProcessManager.getReadyQueue().getSize() >= 1){
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, []));

                }
                this.resetCounter();
            }
            _CPU.execute();
            this.counter++;
        }

        public contextSwitch(): ProcessControlBlock{
            let currentPCB: ProcessControlBlock = _ProcessManager.getRunning();
            // Dequeue next PCB and dispatch for scheduling
            let nextPCB: ProcessControlBlock = _ProcessManager.getReadyQueue().dequeue();
            if (currentPCB == undefined) {
                nextPCB.setState("Running");
                _Scheduler.storeToCPU(nextPCB);
            } else {
                // Save current CPU context in pcb and switch contexts to the next in the ready queue
                _Scheduler.storeToPCB(currentPCB);
                _ProcessManager.getReadyQueue().enqueue(currentPCB.setState("Ready"));
                nextPCB.setState("Running");
                _Scheduler.storeToCPU(nextPCB);
            }
            return nextPCB;
        }

        public storeToPCB(pcb: ProcessControlBlock){
            // Save current CPU content to PCB
            pcb.pc = _CPU.PC;
            pcb.acc = _CPU.Acc;
            pcb.xReg = _CPU.Xreg;
            pcb.yReg = _CPU.Yreg;
            pcb.zFlag = _CPU.Zflag;
            pcb.segment = _CPU.segment;
        }

        public storeToCPU(pcb: ProcessControlBlock){
            // Save current PCB content to CPU
            _CPU.PC = pcb.pc;
            _CPU.Acc = pcb.acc;
            _CPU.Xreg = pcb.xReg;
            _CPU.Yreg = pcb.yReg;
            _CPU.Zflag = pcb.zFlag;
            _CPU.segment = pcb.segment;
        }

        public resetCounter(){
            this.counter = 0;
        }

        updateQuantum() {
            this.resetCounter();
            this.quantum = _Quantum;
        }
    }
}
