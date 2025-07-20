import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Edit3, Tag, Folder, X, Plus } from 'lucide-react';
import { SavedIdea } from '../types/music';
import { saveIdea, getSavedIdeas, loadIdea, deleteIdea, getFolders, getAllTags } from '../utils/saveLoad';

interface SaveLoadPanelProps {
  currentIdea: {
    progression: any;
    settings: SavedIdea['settings'];
  } | null;
  onLoad: (idea: SavedIdea) => void;
  onClose: () => void;
}

export default function SaveLoadPanel({ currentIdea, onLoad, onClose }: SaveLoadPanelProps) {
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  
  // Save form state
  const [saveName, setSaveName] = useState('');
  const [saveFolder, setSaveFolder] = useState('');
  const [saveTags, setSaveTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const folders = getFolders();
  const allTags = getAllTags();

  useEffect(() => {
    refreshIdeas();
  }, []);

  const refreshIdeas = () => {
    setSavedIdeas(getSavedIdeas());
  };

  const handleSave = () => {
    if (!currentIdea || !saveName.trim()) return;

    try {
      saveIdea(
        saveName.trim(),
        currentIdea.progression,
        currentIdea.settings,
        saveFolder.trim() || undefined,
        saveTags,
        editingId || undefined
      );
      
      setShowSaveForm(false);
      setEditingId(null);
      resetSaveForm();
      refreshIdeas();
    } catch (error) {
      console.error('Error saving idea:', error);
    }
  };

  const handleLoad = (idea: SavedIdea) => {
    onLoad(idea);
    onClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      deleteIdea(id);
      refreshIdeas();
    }
  };

  const handleEdit = (idea: SavedIdea) => {
    setSaveName(idea.name);
    setSaveFolder(idea.folder || '');
    setSaveTags(idea.tags);
    setEditingId(idea.id);
    setShowSaveForm(true);
  };

  const resetSaveForm = () => {
    setSaveName('');
    setSaveFolder('');
    setSaveTags([]);
    setNewTag('');
    setEditingId(null);
  };

  const addTag = () => {
    if (newTag.trim() && !saveTags.includes(newTag.trim())) {
      setSaveTags([...saveTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSaveTags(saveTags.filter(tag => tag !== tagToRemove));
  };

  const filteredIdeas = savedIdeas.filter(idea => {
    const folderMatch = !selectedFolder || idea.folder === selectedFolder;
    const tagMatch = !selectedTag || idea.tags.includes(selectedTag);
    return folderMatch && tagMatch;
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-600/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-200 flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-amber-500" />
              Save & Load Ideas
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Save Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-200">Save Current Idea</h3>
              {currentIdea && (
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="btn-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Idea
                </button>
              )}
            </div>

            {showSaveForm && (
              <div className="glass-panel rounded-xl p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="input-field"
                    placeholder="My awesome progression"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Folder (optional)
                  </label>
                  <input
                    type="text"
                    value={saveFolder}
                    onChange={(e) => setSaveFolder(e.target.value)}
                    className="input-field"
                    placeholder="Jazz, Pop, Experimental..."
                    list="folders"
                  />
                  <datalist id="folders">
                    {folders.map(folder => (
                      <option key={folder} value={folder} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 input-field"
                      placeholder="Add a tag..."
                      list="tags"
                    />
                    <button
                      onClick={addTag}
                      className="btn-ghost px-3"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <datalist id="tags">
                    {allTags.map(tag => (
                      <option key={tag} value={tag} />
                    ))}
                  </datalist>
                  
                  {saveTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {saveTags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-amber-900/30 text-amber-300 rounded-full text-xs"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-amber-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!saveName.trim()}
                    className="btn-primary disabled:opacity-50"
                  >
                    {editingId ? 'Update' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveForm(false);
                      resetSaveForm();
                    }}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Load Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-200">Saved Ideas</h3>
              
              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="px-3 py-1 border border-gray-600 rounded-lg text-sm bg-gray-800 text-gray-200"
                >
                  <option value="">All Folders</option>
                  {folders.map(folder => (
                    <option key={folder} value={folder}>{folder}</option>
                  ))}
                </select>
                
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="px-3 py-1 border border-gray-600 rounded-lg text-sm bg-gray-800 text-gray-200"
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredIdeas.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {savedIdeas.length === 0 ? 'No saved ideas yet' : 'No ideas match the current filters'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIdeas.map(idea => (
                  <div key={idea.id} className="glass-panel rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-200">{idea.name}</h4>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(idea)}
                          className="p-1 rounded hover:bg-gray-700 transition-colors"
                        >
                          <Edit3 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(idea.id)}
                          className="p-1 rounded hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-3">
                      <div>{idea.settings.selectedKey} {idea.settings.selectedScale}</div>
                      <div>{idea.settings.selectedTemplate} • {idea.settings.selectedRhythmPattern}</div>
                      {idea.folder && (
                        <div className="flex items-center gap-1 mt-1">
                          <Folder className="w-3 h-3" />
                          {idea.folder}
                        </div>
                      )}
                    </div>

                    {idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {idea.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                          >
                            <Tag className="w-2 h-2" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mb-3">
                      Updated {idea.updatedAt.toLocaleDateString()}
                    </div>

                    <button
                      onClick={() => handleLoad(idea)}
                      className="w-full btn-primary text-sm py-2"
                    >
                      Load Idea
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}