"use client";
import * as React from "react";
import { LexicalEditor } from "lexical";
import { MathNode } from "../../../nodes/MathNode";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  $getNodeStyleValueForProperty,
  $patchStyle,
} from "../../../utils/mathUtils";
import type { MathfieldElement } from "mathlive";
import DropdownColorPicker from "../../../ui/DropdownColorPicker";
import DropDown, { DropDownItem } from "../../../ui/DropDown";
import useModal from "../../../hooks/useModal";
import TextArea from "../../../ui/Textarea";
import Button from "../../../ui/Button";
import { DialogActions } from "../../../ui/Dialog";

export default function MathTools({
  editor,
  node,
  fontColor,
  bgColor,
  isEditable,
}: {
  editor: LexicalEditor;
  node: MathNode;
  fontColor: string;
  bgColor: string;
  isEditable: boolean;
}) {
  const [modal, showModal] = useModal();
  const [fontSize, setFontSize] = useState(null);
  const FONT_SIZE_OPTIONS: [null | string, string][] = [
    [null, "Par défaut"],
    ["6px", "6px"],
    ["8px", "8px"],
    ["10px", "10px"],
    ["12px", "12px"],
    ["15px", "15px"],
    ["18px", "18px"],
    ["22px", "22px"],
    ["26px", "26px"],
    ["30px", "30px"],
  ];

  function dropDownActiveClass(active: boolean) {
    if (active) return "active caprte-dropdown-item-active";
    else return "";
  }

  function MathFontSizeDropDown({
    value,
    disabled = false,
  }: {
    value: string | null;
    disabled?: boolean;
  }): JSX.Element {
    let name = "";
    for (const e of FONT_SIZE_OPTIONS) {
      const [option, text] = e;
      if (option == value) {
        name = text;
        break;
      }
    }

    return (
      <DropDown
        disabled={disabled}
        buttonClassName={"toolbar-item font-size"}
        buttonLabel={name}
        buttonIconClassName={"icon block-type font-size"}
        buttonAriaLabel={"Choix de la taille de police"}
      >
        {FONT_SIZE_OPTIONS.map(([option, text]) => (
          <DropDownItem
            className={`item ${dropDownActiveClass(
              value === option
            )} ${"fontsize-item"}`}
            onClick={() => onFontSizeSelect(option)}
            key={option}
          >
            <span className="text">{text}</span>
          </DropDownItem>
        ))}
      </DropDown>
    );
  }

  useEffect(() => {
    editor.getEditorState().read(() => {
      const fontSize = $getNodeStyleValueForProperty(node, "font-size", null);
      setFontSize(fontSize);
    });
  }, [node]);

  const applyStyleMath = useCallback(
    (styles: Record<string, string>) => {
      editor.update(() => {
        $patchStyle([node], styles);
      });
    },
    [editor, node]
  );

  const onFontSizeSelect = useCallback(
    (fontSize: string) => {
      setFontSize(fontSize);
      applyStyleMath({ "font-size": fontSize });
    },
    [applyStyleMath]
  );

  const onColorChange = useCallback(
    (key: string, value: string) => {
      const styleKey = key === "text" ? "color" : "background-color";
      const mathfield = node.getMathfield();
      if (!mathfield) return;
      if (mathfield.selectionIsCollapsed) {
        applyStyleMath({ [styleKey]: value });
      } else {
        const style =
          key === "text" ? { color: value } : { backgroundColor: value };
        const selection = mathfield.selection;
        const range = selection.ranges[0];
        mathfield.applyStyle(style, range);
        mathfield.executeCommand("commit");
      }
    },
    [applyStyleMath, node]
  );

  const openEditDialog = useCallback(() => {
    showModal("Éditer LaTeX", (onClose) => (
      <EditLatexDialog
        isEditable={isEditable}
        node={node}
        onConfirm={(latex) => {
          editor.update(() => {
            node.setValue(latex);
          });
          onClose();
        }}
        onCancel={onClose}
      />
    ));
  }, [isEditable, node]);

  const openWolfram = useCallback(() => {
    const mathfield = node.getMathfield();
    if (!mathfield) return;
    const selection = mathfield.selection;
    const value =
      mathfield.getValue(selection, "latex-unstyled") ||
      mathfield.getValue("latex-unstyled");
    window.open(
      `https://www.wolframalpha.com/input?i=${encodeURIComponent(value)}`
    );
  }, [node]);

  return (
    <>
      <button
        onClick={openWolfram}
        className={"toolbar-item spaced"}
        title="Ouvrir Wolfram"
        type="button"
        aria-label="Ouvrir Wolfram"
      >
        <i className="format wolfram" />
        <span className="crte-ibuttontext">Wolfram</span>
      </button>
      <button
        disabled={!isEditable}
        onClick={openEditDialog}
        className={"toolbar-item spaced"}
        title="Modifier LaTeX"
        type="button"
        aria-label="Modifier LaTeX"
      >
        <i className="format tex" />
        <span className="crte-ibuttontext">LaTeX</span>
      </button>
      <Divider />
      <MathFontSizeDropDown value={fontSize} disabled={!isEditable} />
      {/* TODO: debug color pickers (infinite loop when used for now)
      <DropdownColorPicker
        buttonClassName="toolbar-item color-picker"
        buttonAriaLabel="Formatter la couleur de texte (maths)"
        buttonIconClassName="icon font-color"
        color={fontColor}
        onChange={(value) => onColorChange("text", value)}
        title="text color"
      />
      <DropdownColorPicker
        buttonClassName="toolbar-item color-picker"
        buttonAriaLabel="Formatter la couleur de fond (maths)"
        buttonIconClassName="icon bg-color"
        color={bgColor}
        onChange={(value) => onColorChange("background", value)}
        title="text color"
      />
      */}
      <button
        disabled={!isEditable}
        onClick={() => {
          editor.update(() => {
            node.selectPrevious();
            node.remove();
          });
        }}
        className={"toolbar-item spaced"}
        title="Supprimer"
        type="button"
        aria-label="Supprimer"
      >
        <i className="format clear" />
      </button>
      {modal}
    </>
  );
}

function EditLatexDialog({
  node,
  isEditable,
  onConfirm,
  onCancel,
}: {
  node: MathNode;
  isEditable: boolean;
  onConfirm: (s: string) => void;
  onCancel: () => void;
}) {
  const [latex, setLatex] = useState(node.getValue());
  const mathfieldRef = useRef<MathfieldElement>(null);

  const updateLatex = useCallback(
    (value: string) => {
      setLatex(value);
      if (mathfieldRef.current) {
        mathfieldRef.current.setValue(value);
      }
    },
    [latex]
  );

  useEffect(() => {
    updateLatex(node.getValue());
  }, [node]);

  return (
    <div>
      <TextArea
        label="LaTeX"
        placeholder="ex : \frac{2x}{3}"
        onChange={updateLatex}
        value={latex}
        data-test-id="image-modal-url-input"
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div>Prévisualisation :</div>
        <math-field
          ref={mathfieldRef}
          value={latex}
          style={{ width: "auto", margin: "0 auto" }}
          read-only
        ></math-field>
      </div>
      <DialogActions>
        <Button
          onClick={() => {
            setLatex(node.getValue());
            onCancel();
          }}
        >
          Annuler
        </Button>
        <Button
          disabled={!isEditable}
          onClick={() => {
            onConfirm(latex);
          }}
        >
          Confirmer
        </Button>
      </DialogActions>
    </div>
  );
}

function Divider(): JSX.Element {
  return <div className="divider" />;
}
