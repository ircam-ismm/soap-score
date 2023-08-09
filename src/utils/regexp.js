export const splitWordsRegexp = / +(?=(?:(?:[^"]*"){2})*[^"]*$)/g;
// @note - must accept composed signature 2+3+2/8
export const barSignatureRegexp = /^\[([0-9\+]+)\/([0-9]+)\]$/;
// units signature, concatenation of simple signature (without additive notation)
export const unitsSignatureRegexp = /^(\[([0-9]+)\/([0-9]+)\])+$/;
// same as bar signature but do not accept additive signatures
export const tempoBasisSignatureRegexp = /^\[([0-9]+)\/([0-9]+)\]$/;
// check this absolute duration syntax
export const absDurationRegexp = /^([0-9hms\.]+)$/;
// export const bracketDefaultRegExp = /^\[.*\]$/;
export const tempoSyntaxRegexp = /^\[([0-9]+\/[0-9]+)\]\=([0-9\.]+)$/;
export const tempoEquivalenceRegexp = /^\[([0-9]+\/[0-9]+)\]\=\[([0-9]+\/[0-9]+)\]/;
export const fermataSyntaxRegexp = /^\[([0-9]+\/[0-9]+)\]\=([0-9hms\?\*\.]+)$/;
