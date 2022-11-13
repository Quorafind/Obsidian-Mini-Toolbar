import { EditorState } from "@codemirror/state";
import { editorViewField } from "obsidian";

export const cutText = (state: EditorState) => {
  const editor = getEditorFromState(state);
  const originText = editor.getSelection();
  window.navigator.clipboard.writeText(editor.getSelection());
  editor.replaceSelection("", originText);
};

export const copyText = (state: EditorState) => {
  const editor = getEditorFromState(state);
  window.navigator.clipboard.writeText(editor.getSelection());
};

export const boldText = () => {
  console.log("Hi");
  app.commands.executeCommandById("editor:toggle-bold", app);
};

export const strikethroughText = () => {
  app.commands.executeCommandById("editor:toggle-strikethrough", app);
};

export const markText = () => {
  app.commands.executeCommandById("editor:toggle-highlight", app);
};

export const italicText = () => {
  app.commands.executeCommandById("editor:toggle-italics", app);
};

export const getEditorFromState = (state: EditorState) => {
  return state.field(editorViewField).editor;
};
