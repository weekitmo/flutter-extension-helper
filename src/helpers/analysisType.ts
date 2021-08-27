export interface CompletionExistingImportsNotification {
  /**
   * The defining file of the library.
   */
  file: string

  /**
   * The existing imports in the library.
   */
  imports: ExistingImports
}
export interface ExistingImports {
  /**
   * The set of all unique imported elements for all imports.
   */
  elements: ImportedElementSet

  /**
   * The list of imports in the library.
   */
  imports: ExistingImport[]
}
export interface ImportedElementSet {
  /**
   * The list of unique strings in this object.
   */
  strings: string[]

  /**
   * The library URI part of the element.
   * It is an index in the strings field.
   */
  uris: number[]

  /**
   * The name part of a the element.
   * It is an index in the strings field.
   */
  names: number[]
}
export interface ExistingImport {
  /**
   * The URI of the imported library.
   * It is an index in the strings field, in the enclosing
   * ExistingImports and its ImportedElementSet object.
   */
  uri: number

  /**
   * The list of indexes of elements, in the enclosing
   * ExistingImports object.
   */
  elements: number[]
}
