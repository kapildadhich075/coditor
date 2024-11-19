import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Editor from "@monaco-editor/react";
import { LANGUAGES } from "@/constants/languages";

// Language configurations

const CodeEditor: React.FC = () => {
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [savedSnippets, setSavedSnippets] = useState<
    { id: string; language: string; code: string }[]
  >([]);

  const handleCodeChange = (value?: string) => {
    setCode(value || "");
  };

  const executeCode = async () => {
    try {
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: language.value, code }),
      });
      const result = await response.json();
      setOutput(result.output);
    } catch {
      setOutput("Execution failed");
    }
  };

  const saveSnippet = () => {
    const newSnippet = {
      id: Date.now().toString(),
      language: language.value,
      code,
    };
    setSavedSnippets([...savedSnippets, newSnippet]);
  };

  const deleteSnippet = (id: string) => {
    setSavedSnippets(savedSnippets.filter((snippet) => snippet.id !== id));
  };

  const shareSnippet = (snippet: {
    id: string;
    language: string;
    code: string;
  }) => {
    // Implement sharing logic (e.g., generate shareable link)
    navigator.clipboard.writeText(snippet.code);
    alert("Snippet copied to clipboard!");
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Online Code Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Select
              value={language.value}
              onValueChange={(value) =>
                setLanguage(LANGUAGES.find((l) => l.value === value)!)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={executeCode}>Run Code</Button>
            <Button variant="secondary" onClick={saveSnippet}>
              Save Snippet
            </Button>
          </div>

          <Tabs defaultValue="editor">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="snippets">Saved Snippets</TabsTrigger>
            </TabsList>
            <TabsContent value="editor">
              <Editor
                height="50vh"
                language={language.mode}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </TabsContent>
            <TabsContent value="output">
              <Textarea
                value={output}
                readOnly
                placeholder="Code output will appear here"
                className="h-[50vh]"
              />
            </TabsContent>
            <TabsContent value="snippets">
              <div className="space-y-2">
                {savedSnippets.map((snippet) => (
                  <Card key={snippet.id}>
                    <CardContent className="flex justify-between items-center p-4">
                      <span>{snippet.language} Snippet</span>
                      <div className="space-x-2">
                        <Button size="sm" onClick={() => setCode(snippet.code)}>
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => shareSnippet(snippet)}
                        >
                          Share
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSnippet(snippet.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeEditor;
