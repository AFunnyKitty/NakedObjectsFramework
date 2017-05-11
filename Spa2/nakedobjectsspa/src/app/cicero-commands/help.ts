import * as Cicerocommands from './command-result';
import * as Command from './Command';
import * as Usermessages from '../user-messages';
import { Location } from '@angular/common';

export class Help extends Command.Command {

    fullCommand = Usermessages.helpCommand;
    helpText = Usermessages.helpHelp;
    protected minArguments = 0;
    protected maxArguments = 1;

    isAvailableInCurrentContext(): boolean {
        return true;
    }

   

    doExecuteNew(args: string, chained: boolean): Promise<Cicerocommands.CommandResult> {
        const arg = this.argumentAsString(args, 0);
        if (!arg) {
            return this.returnResult("", Usermessages.basicHelp);
        } else if (arg === "?") {
            const commands = this.commandFactory.allCommandsForCurrentContext();
            return this.returnResult("", commands);
        } else {
            try {
                const c = this.commandFactory.getCommand(arg);
                return this.returnResult("", `${c.fullCommand} command:\n${c.helpText}`);
            } catch (e) {
                return this.returnResult("", e.message);
            }
        }
    };
}