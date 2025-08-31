import React, { useState } from 'react';
import { resumeTemplates, templateCategories } from '../data/resumeTemplates';
import './TemplateSelector.css';

const TemplateSelector = ({ onTemplateSelect, selectedTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('All Templates');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = resumeTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'All Templates' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.suitable.some(suit => suit.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleTemplateClick = (template) => {
    onTemplateSelect(template);
  };

  return (
    <div className="template-selector">
      <div className="template-selector-header">
        <h2>Choose Your Resume Template</h2>
        <p>Select from our collection of professional, ATS-friendly resume templates</p>
      </div>

      <div className="template-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-filters">
          {templateCategories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="templates-grid">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
            onClick={() => handleTemplateClick(template)}
          >
            <div className="template-thumbnail">
              <div 
                className="template-preview"
                style={{
                  background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})`
                }}
              >
                <div className="preview-content">
                  <div className="preview-header" style={{ backgroundColor: template.colors[0] }}></div>
                  <div className="preview-lines">
                    <div className="preview-line long" style={{ backgroundColor: template.colors[2] }}></div>
                    <div className="preview-line medium" style={{ backgroundColor: template.colors[1] }}></div>
                    <div className="preview-line short" style={{ backgroundColor: template.colors[2] }}></div>
                  </div>
                  <div className="preview-section">
                    <div className="preview-line medium" style={{ backgroundColor: template.colors[1] }}></div>
                    <div className="preview-line long" style={{ backgroundColor: template.colors[2] }}></div>
                  </div>
                </div>
              </div>
              {selectedTemplate?.id === template.id && (
                <div className="selected-indicator">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill="#10b981"/>
                    <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="template-info">
              <h3 className="template-name">{template.name}</h3>
              <p className="template-description">{template.description}</p>
              
              <div className="template-features">
                {template.features.slice(0, 2).map((feature, index) => (
                  <span key={index} className="feature-tag">{feature}</span>
                ))}
              </div>
              
              <div className="template-suitable">
                <span className="suitable-label">Best for:</span>
                <span className="suitable-text">{template.suitable.join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="no-templates">
          <p>No templates found matching your criteria.</p>
          <button onClick={() => { setSearchTerm(''); setSelectedCategory('All Templates'); }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;