module TSOS {
    export class ShellCommand {
        constructor(public func: any,
                    public command: string = "",
                    public description: string = "") {
        }

        public getCmdName(): string{
            return this.command;
        }
    }
}
