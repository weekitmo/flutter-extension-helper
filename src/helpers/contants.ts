import { CompletionItem, Location, MarkdownString, TextDocument } from "vscode"

export const FLUTTER_PUBSPEC = `pubspec.yaml`

export interface Scantype {
  importValue: string
  short: string
  wholeRaw: string
  key: string
  origin: string
}

export type DocumentYaml = {
  [props: string]: any
} | null

export type DefaultObject = {
  [props: string]: any
}

export const dartCodeExtensionIdentifier = "Dart-Code.dart-code"

export interface DelayedCompletionItem extends LazyCompletionItem {
  autoImportUri: string
  document: TextDocument
  enableCommitCharacters: boolean
  filePath: string
  insertArgumentPlaceholders: boolean
  nextCharacter: string
  offset: number
  relevance: number
  replacementLength: number
  replacementOffset: number
  suggestion: AvailableSuggestion
  suggestionSetID: number
}

// To avoid sending back huge docs for every completion item, we stash some data
// in our own fields (which won't serialise) and then restore them in resolve()
// on an individual completion basis.
export interface LazyCompletionItem extends CompletionItem {
  // tslint:disable-next-line: variable-name
  _documentation?: string | MarkdownString
}

export interface AvailableSuggestion {
  /**
   * The identifier to present to the user for code completion.
   */
  label: string

  /**
   * The URI of the library that declares the element being suggested,
   * not the URI of the library associated with the enclosing
   * AvailableSuggestionSet.
   */
  declaringLibraryUri: string

  /**
   * Information about the element reference being suggested.
   */
  element: Element

  /**
   * A default String for use in generating argument list source contents
   * on the client side.
   */
  defaultArgumentListString?: string

  /**
   * Pairs of offsets and lengths describing 'defaultArgumentListString'
   * text ranges suitable for use by clients to set up linked edits of
   * default argument source contents. For example, given an argument list
   * string 'x, y', the corresponding text range [0, 1, 3, 1], indicates
   * two text ranges of length 1, starting at offsets 0 and 3. Clients can
   * use these ranges to treat the 'x' and 'y' values specially for linked
   * edits.
   */
  defaultArgumentListTextRanges?: number[]

  /**
   * If the element is an executable, the names of the formal parameters of
   * all kinds - required, optional positional, and optional named. The
   * names of positional parameters are empty strings. Omitted if the element
   * is not an executable.
   */
  parameterNames?: string[]

  /**
   * If the element is an executable, the declared types of the formal parameters
   * of all kinds - required, optional positional, and optional named.
   * Omitted if the element is not an executable.
   */
  parameterTypes?: string[]

  /**
   * This field is set if the relevance of this suggestion might be
   * changed depending on where completion is requested.
   */
  relevanceTags?: AvailableSuggestionRelevanceTag[]

  /**
   *
   */
  requiredParameterCount?: number
}
export type AvailableSuggestionRelevanceTag = string

/**
 * Information about an element (something that can be declared in code).
 */
export interface Element {
  /**
   * The kind of the element.
   */
  kind: ElementKind

  /**
   * The name of the element. This is typically used as the label in the
   * outline.
   */
  name: string

  /**
   * The location of the name in the declaration of the element.
   */
  location?: Location

  /**
   * A bit-map containing the following flags:
   */
  flags: number

  /**
   * The parameter list for the element. If the element is not a method or
   * function this field will not be defined. If the element doesn't have
   * parameters (e.g. getter), this field will not be defined. If the
   * element has zero parameters, this field will have a value of "()".
   */
  parameters?: string

  /**
   * The return type of the element. If the element is not a method or
   * function this field will not be defined. If the element does not have
   * a declared return type, this field will contain an empty string.
   */
  returnType?: string

  /**
   * The type parameter list for the element. If the element doesn't have
   * type parameters, this field will not be defined.
   */
  typeParameters?: string
}

/**
 * An enumeration of the kinds of elements.
 */
export type ElementKind =
  | "CLASS"
  | "CLASS_TYPE_ALIAS"
  | "COMPILATION_UNIT"
  | "CONSTRUCTOR"
  | "CONSTRUCTOR_INVOCATION"
  | "ENUM"
  | "ENUM_CONSTANT"
  | "EXTENSION"
  | "FIELD"
  | "FILE"
  | "FUNCTION"
  | "FUNCTION_INVOCATION"
  | "FUNCTION_TYPE_ALIAS"
  | "GETTER"
  | "LABEL"
  | "LIBRARY"
  | "LOCAL_VARIABLE"
  | "METHOD"
  | "MIXIN"
  | "PARAMETER"
  | "PREFIX"
  | "SETTER"
  | "TOP_LEVEL_VARIABLE"
  | "TYPE_PARAMETER"
  | "UNIT_TEST_GROUP"
  | "UNIT_TEST_TEST"
  | "UNKNOWN"
