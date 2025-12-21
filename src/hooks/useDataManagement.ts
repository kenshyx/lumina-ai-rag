import { useState } from 'react';

import { FileItem } from '../types';

export const useDataManagement = () => {
    const [files, setFilesState] = useState<FileItem[]>([]);
    const [isGeneratingData, setIsGeneratingData] = useState<boolean>(false);
    const [isIndexing, setIsIndexing] = useState<boolean>(false);
    const [ragStatus, setRagStatus] = useState<string>("Idle");

    const addFile = (file: FileItem) => {
        setFilesState(prev => [...prev, file]);
    };

    const removeFile = (id: number) => {
        setFilesState(prev => prev.filter(f => f.id !== id));
    };

    const handleFileUpload = async (file: File) => {
        const fileId = Math.random();
        try {
            const content = await file.text();
            addFile({ name: file.name, id: fileId, content });
        } catch (err) {
            console.error('Failed to read file:', err);
            addFile({ name: file.name, id: fileId });
        }
    };


    const indexDocuments = async (ragIndexFunction?: (files: FileItem[]) => Promise<void>) => {
        if (files.length === 0) return;
        
        setIsIndexing(true);
        setRagStatus("Indexing...");
        
        try {
            if (ragIndexFunction) {
                await ragIndexFunction(files);
                setRagStatus("Knowledge Base Ready");
            } else {
                // Fallback: simulate indexing delay if RAG not available
                await new Promise(resolve => setTimeout(resolve, 1500));
                setRagStatus("Knowledge Base Ready");
            }
        } catch (err) {
            console.error('Indexing failed:', err);
            setRagStatus("Indexing Failed");
        } finally {
            setIsIndexing(false);
        }
    };

    const setFiles = (value: FileItem[] | ((prev: FileItem[]) => FileItem[])) => {
        if (typeof value === 'function') {
            setFilesState(prev => value(prev));
        } else {
            setFilesState(value);
        }
    };

    return {
        files,
        setFiles,
        isGeneratingData,
        setIsGeneratingData,
        isIndexing,
        ragStatus,
        setRagStatus,
        addFile,
        removeFile,
        handleFileUpload,
        indexDocuments
    };
};

