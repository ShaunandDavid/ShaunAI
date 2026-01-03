export type ModelProvider = "openai" | "azure-openai" | "anthropic";

export type ModelRequest = {
  provider: ModelProvider;
  model: string;
  input: string;
};

export type ModelResponse = {
  output: string;
  provider: ModelProvider;
  model: string;
};

export type RouterConfig = {
  defaultProvider: ModelProvider;
};

export interface ModelRouter {
  run(request: ModelRequest): Promise<ModelResponse>;
}

export function createModelRouter(config: RouterConfig): ModelRouter {
  return {
    async run(request) {
      throw new Error(
        `Model router not implemented for ${request.provider}. Default=${config.defaultProvider}`
      );
    }
  };
}
