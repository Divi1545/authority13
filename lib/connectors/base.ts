export abstract class BaseConnector {
  protected config: any

  constructor(config: any) {
    this.config = config
  }

  abstract test(): Promise<boolean>
  abstract execute(toolName: string, input: any): Promise<any>
}
