import * as core from '@actions/core';

export function getInputAsBool(
  name: string,
  options?: core.InputOptions
): boolean {
  const result = core.getInput(name, options);
  return result.toLowerCase() === 'true';
}
