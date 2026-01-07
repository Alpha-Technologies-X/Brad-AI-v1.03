import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, PanelLeftClose, Plus, Copy, Play, Check, ChevronDown, Image, Video, Sparkles, Code, Zap, Trash2 } from 'lucide-react';

export default function BradAI() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState('Brad AI 1.12.2x');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const models = [
    { name: 'Brad AI 1.12.2x', description: 'Swift, Powerful, Light-Weight', icon: Zap },
    { name: 'Brad AI 1.4.3r', description: 'Creative & imaginative responses', icon: Sparkles },
    { name: 'Brad AI 1.5.16e', description: 'Coding & math specialist', icon: Code },
    { name: 'Brad AI 2.1.5vx Ultra', description: 'Extreme math & coding power', icon: Sparkles }
  ];

  const suggestions = [
    { icon: Code, text: 'Write a Python function to sort a list' },
    { icon: Image, text: 'Generate an image of a futuristic city' },
    { icon: Video, text: 'Create a video of ocean waves' },
    { icon: Sparkles, text: 'Explain quantum computing simply' }
  ];

  const currentChat = chats.find(chat => chat.id === currentChatId);
  const messages = currentChat?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New conversation',
      messages: [],
      createdAt: new Date()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const updateChatTitle = (chatId, firstMessage) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '') }
        : chat
    ));
  };

  const parseCodeBlocks = (content) => {
    if (!content) return [{ type: 'text', content: '' }];
    
    const parts = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push({ type: 'text', content: textBefore });
        }
      }
      
      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        content: match[2].trim()
      });
      
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (lastIndex < content.length) {
      const textAfter = content.slice(lastIndex);
      if (textAfter.trim()) {
        parts.push({ type: 'text', content: textAfter });
      }
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const runCode = (code, language) => {
    if (language === 'javascript' || language === 'js') {
      try {
        const result = eval(code);
        alert(`Output: ${result}`);
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    } else {
      alert('Code execution is currently only supported for JavaScript');
    }
  };

  const generateImageWithAI = (prompt) => {
    const keywords = prompt.replace(/generate|create|make|image|picture|of|a|an|the|show|me/gi, '').trim();
    const cleanKeywords = keywords.split(' ').filter(w => w.length > 2).slice(0, 2).join(' ');
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanKeywords || 'random')}?width=800&height=600&nologo=true&seed=${Date.now()}`;
  };

  const typewriterEffect = (chatId, messageId, fullText) => {
    let currentIndex = 0;
    
    const type = () => {
      if (currentIndex < fullText.length) {
        const currentText = fullText.substring(0, currentIndex + 1);
        
        setChats(prev => prev.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === messageId
                    ? { ...msg, content: currentText, isTyping: true }
                    : msg
                )
              }
            : chat
        ));
        
        currentIndex++;
        typingIntervalRef.current = setTimeout(type, 20);
      } else {
        setChats(prev => prev.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === messageId
                    ? { ...msg, isTyping: false }
                    : msg
                )
              }
            : chat
        ));
        setTypingMessageId(null);
      }
    };
    
    type();
  };

  const sendMessage = async (messageText = null) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || loading) return;

    let activeChatId = currentChatId;

    if (!activeChatId) {
      const newChat = {
        id: Date.now(),
        title: userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : ''),
        messages: [],
        createdAt: new Date()
      };
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      activeChatId = newChat.id;
    } else if (messages.length === 0) {
      updateChatTitle(activeChatId, userMessage);
    }

    setChats(prev => prev.map(chat =>
      chat.id === activeChatId
        ? { ...chat, messages: [...chat.messages, { role: 'user', content: userMessage }] }
        : chat
    ));

    setInput('');
    setLoading(true);

    const isImageRequest = /generate.*image|create.*image|make.*image|draw|picture of|show me.*image/i.test(userMessage);
    const isVideoRequest = /generate.*video|create.*video|make.*video/i.test(userMessage);

    try {
      if (isImageRequest) {
        const imageUrl = generateImageWithAI(userMessage);
        const messageId = Date.now();

        setChats(prev => prev.map(chat =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, {
                  id: messageId,
                  role: 'assistant',
                  content: '',
                  model: selectedModel,
                  image: imageUrl
                }]
              }
            : chat
        ));

        setLoading(false);
        setTypingMessageId(messageId);
        typewriterEffect(activeChatId, messageId, "I've generated an image based on your request!");
        return;
      }

      if (isVideoRequest) {
        const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        const messageId = Date.now();

        setChats(prev => prev.map(chat =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, {
                  id: messageId,
                  role: 'assistant',
                  content: '',
                  model: selectedModel,
                  video: videoUrl
                }]
              }
            : chat
        ));

        setLoading(false);
        setTypingMessageId(messageId);
        typewriterEffect(activeChatId, messageId, "I've created a sample video for you! (Full video generation feature coming soon)");
        return;
      }

      const needsWebSearch = /latest|current|today|news|weather|stock|price|who is|what is happening|recent|what's|whats/i.test(userMessage);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: 'When providing code examples, always wrap them in markdown code blocks using triple backticks with the language name. Example: ```python\ncode here\n```',
          tools: needsWebSearch ? [{
            type: "web_search_20250305",
            name: "web_search"
          }] : undefined,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
        }),
      });

      const data = await response.json();

      if (data.content && data.content.length > 0) {
        const textContent = data.content
          .filter(item => item.type === 'text')
          .map(item => item.text)
          .join('\n');

        const messageId = Date.now();

        setChats(prev => prev.map(chat =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, {
                  id: messageId,
                  role: 'assistant',
                  content: '',
                  model: selectedModel
                }]
              }
            : chat
        ));

        setLoading(false);
        setTypingMessageId(messageId);
        typewriterEffect(activeChatId, messageId, textContent || 'I received your message but had trouble generating a response.');
      } else {
        const messageId = Date.now();

        setChats(prev => prev.map(chat =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, {
                  id: messageId,
                  role: 'assistant',
                  content: '',
                  model: selectedModel
                }]
              }
            : chat
        ));

        setLoading(false);
        setTypingMessageId(messageId);
        typewriterEffect(activeChatId, messageId, 'Sorry, I encountered an error. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      const messageId = Date.now();

      setChats(prev => prev.map(chat =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [...chat.messages, {
                id: messageId,
                role: 'assistant',
                content: '',
                model: selectedModel
              }]
            }
          : chat
      ));

      setLoading(false);
      setTypingMessageId(messageId);
      typewriterEffect(activeChatId, messageId, 'Sorry, I couldn\'t connect to the AI service. Please check your connection and try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <button 
              onClick={createNewChat}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-300" />
              <span className="text-sm font-medium text-gray-300">New chat</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3">
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 px-3 mb-2">Your Chats</div>
              {chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => setCurrentChatId(chat.id)}
                  className={`group relative w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    currentChatId === chat.id ? 'bg-gray-800' : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="text-sm text-gray-300 truncate pr-6">{chat.title}</div>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-800">
            <div className="text-xs text-gray-500">Brad AI v1.0</div>
            <div className="text-xs text-gray-600 mt-1">Alpha Technologies</div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 border-b border-gray-800 flex items-center px-4 gap-3 justify-between bg-gray-950">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5 text-gray-300" /> : <Menu className="w-5 h-5 text-gray-300" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-semibold text-gray-100">Brad AI</span>
            </div>
          </div>

          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium text-gray-300">{selectedModel}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showModelMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                {models.map((model) => {
                  const IconComponent = model.icon;
                  return (
                    <button
                      key={model.name}
                      onClick={() => {
                        setSelectedModel(model.name);
                        setShowModelMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-750 first:rounded-t-lg last:rounded-b-lg flex items-start gap-3"
                    >
                      <IconComponent className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm text-gray-200">{model.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{model.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Messages Area or Start Page */}
        <div className="flex-1 overflow-y-auto">
          {!currentChatId ? (
            // Start Page
            <div className="h-full flex items-center justify-center px-4">
              <div className="max-w-3xl w-full text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white font-bold text-4xl">B</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-100 mb-3">Welcome to Brad AI</h1>
                <p className="text-lg text-gray-400 mb-8">Your intelligent assistant for code, images, videos, and more</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {suggestions.map((suggestion, index) => {
                    const IconComponent = suggestion.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="flex items-center gap-3 p-4 bg-gray-800 border-2 border-gray-700 rounded-xl hover:border-amber-500 hover:shadow-md transition-all text-left"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-200">{suggestion.text}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Code Execution
                  </span>
                  <span className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Image Generation
                  </span>
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video Creation
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Messages
            <div className="max-w-3xl mx-auto px-4 py-8">
              {messages.map((message, msgIndex) => (
                <div key={msgIndex} className="mb-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {message.role === 'assistant' ? (
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-sm flex items-center justify-center">
                          <span className="text-white font-bold text-sm">B</span>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center">
                          <span className="text-white font-bold text-sm">Y</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold text-sm text-gray-100">
                          {message.role === 'assistant' ? 'Brad' : 'You'}
                        </div>
                        {message.model && (
                          <div className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                            {message.model}
                          </div>
                        )}
                      </div>
                      <div className="text-gray-300 leading-7">
                        {message.image && (
                          <div className="my-4">
                            <img 
                              src={message.image} 
                              alt="Generated by Brad AI" 
                              className="rounded-lg border border-gray-700 max-w-full shadow-lg"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/800x600/1f2937/f59e0b?text=Image+Generated';
                              }}
                            />
                          </div>
                        )}
                        {message.video && (
                          <div className="my-4">
                            <video 
                              src={message.video} 
                              controls 
                              className="rounded-lg border border-gray-700 max-w-full shadow-lg"
                            />
                          </div>
                        )}
                        {message.content && parseCodeBlocks(message.content).map((part, partIndex) => {
                          if (part.type === 'code') {
                            const codeId = `${msgIndex}-${partIndex}`;
                            return (
                              <div key={partIndex} className="my-4 rounded-lg border border-gray-700 overflow-hidden bg-gray-950">
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
                                  <span className="text-xs font-medium text-gray-400">{part.language}</span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => runCode(part.content, part.language)}
                                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                                    >
                                      <Play className="w-3 h-3" />
                                      Run
                                    </button>
                                    <button
                                      onClick={() => copyToClipboard(part.content, codeId)}
                                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                                    >
                                      {copiedIndex === codeId ? (
                                        <>
                                          <Check className="w-3 h-3" />
                                          Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          Copy
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                                <pre className="p-4 overflow-x-auto">
                                  <code className="text-sm text-gray-300 font-mono">{part.content}</code>
                                </pre>
                              </div>
                            );
                          } else if (part.content.trim()) {
                            return (
                              <div key={partIndex} className="whitespace-pre-wrap">
                                {part.content}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="mb-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-sm flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                        <span className="text-white font-bold text-sm relative z-10">B</span>
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="font-semibold text-sm text-gray-100 mb-2">Brad</div>
                      <div className="text-gray-400 text-sm">Thinking...</div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 bg-gray-950">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Brad... Try asking for code, images, or videos!"
                className="w-full resize-none rounded-xl border border-gray-700 bg-gray-800 pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-100 placeholder-gray-500 max-h-48"
                rows="1"
                disabled={loading}
                style={{ minHeight: '48px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="absolute right-2 bottom-2 p-2 bg-amber-500 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-gray-500 text-center mt-3">
              Brad can make mistakes. Please verify important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
