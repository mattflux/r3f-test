import React from 'react'
import {Route, Routes} from 'react-router-dom';
import CodeEditor from './CodeEditor';
import Scene from "./Scene";

export default function App() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Scene/>} />
                <Route path="/code" element={<CodeEditor/>} />
            </Routes>
        </div>
    )
}
