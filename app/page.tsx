'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Archive, Settings, Calendar, Sparkles, Clock, Users, MessageSquare, CheckCircle, FileText, FolderOpen, AlertTriangle, MessageCircle, DollarSign, MoreHorizontal } from 'lucide-react';

const categories = [
  'スケジュール管理',
  'クライアント対応',
  'チームマネジメント',
  '品質管理',
  '要件定義・仕様決め',
  'リソース管理',
  'リスク管理',
  'コミュニケーション',
  '予算管理',
  'その他'
];

const categoryIcons: { [key: string]: any } = {
  'スケジュール管理': Clock,
  'クライアント対応': Users,
  'チームマネジメント': MessageSquare,
  '品質管理': CheckCircle,
  '要件定義・仕様決め': FileText,
  'リソース管理': FolderOpen,
  'リスク管理': AlertTriangle,
  'コミュニケーション': MessageCircle,
  '予算管理': DollarSign,
  'その他': MoreHorizontal
};

const categoryColors: { [key: string]: string } = {
  'スケジュール管理': '#93c5fd',
  'クライアント対応': '#fda4af',
  'チームマネジメント': '#c4b5fd',
  '品質管理': '#86efac',
  '要件定義・仕様決め': '#fcd34d',
  'リソース管理': '#fdba74',
  'リスク管理': '#fb923c',
  'コミュニケーション': '#a78bfa',
  '予算管理': '#34d399',
  'その他': '#d4d4d8'
};

const noiseBackground = {
  backgroundColor: '#e5e5e5',
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`
};

const pmQuestions = [
  { text: "スケジュールが遅延しています", color: "rgba(147, 197, 253, 0.4)" },
  { text: "クライアントの要望が変わりました", color: "rgba(253, 164, 175, 0.4)" },
  { text: "チームメンバーのモチベーションが下がっています", color: "rgba(196, 181, 253, 0.4)" },
  { text: "品質とスピードどちらを優先すべきですか", color: "rgba(134, 239, 172, 0.4)" },
  { text: "要件定義が曖昧なまま進んでいます", color: "rgba(252, 211, 77, 0.4)" },
  { text: "リソースが足りません", color: "rgba(253, 186, 116, 0.4)" },
  { text: "想定外のリスクが発生しました", color: "rgba(251, 146, 60, 0.4)" },
  { text: "ステークホルダー間の意見が対立しています", color: "rgba(167, 139, 250, 0.4)" },
  { text: "予算がオーバーしそうです", color: "rgba(52, 211, 153, 0.4)" },
  { text: "優先順位の付け方がわかりません", color: "rgba(147, 197, 253, 0.4)" },
  { text: "スコープクリープが起きています", color: "rgba(253, 164, 175, 0.4)" },
  { text: "デイリースタンドアップがうまく機能しません", color: "rgba(196, 181, 253, 0.4)" },
  { text: "テスト期間が確保できません", color: "rgba(134, 239, 172, 0.4)" },
  { text: "技術的負債をどう扱えばいいですか", color: "rgba(252, 211, 77, 0.4)" },
  { text: "リリース判断に迷っています", color: "rgba(167, 139, 250, 0.4)" }
];

const FloatingQuestion = ({ text, delay, duration, yPosition, color, startOffset }: any) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      className="absolute whitespace-nowrap pointer-events-none"
      style={{
        fontFamily: 'Quicksand, sans-serif',
        fontWeight: 500,
        fontSize: '32px',
        color: color,
        top: `${yPosition}%`,
        left: `${startOffset}%`,
        animation: isVisible ? `floatText ${duration}s linear ${delay}s infinite` : 'none',
        willChange: 'transform'
      }}
    >
      {text}
    </div>
  );
};

const AnimationStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes floatText {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(calc(-100vw - 100%));
      }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
  `}} />
);

const FontLoader = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;700&display=swap" rel="stylesheet" />
  </>
);

export default function PMKnowledgeApp() {
  const [screen, setScreen] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [conversationLength, setConversationLength] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pm-knowledge-history');
    if (saved) setHistory(JSON.parse(saved));
    const savedWebhook = localStorage.getItem('slack-webhook');
    if (savedWebhook) setSlackWebhook(savedWebhook);
    const savedApiKey = localStorage.getItem('anthropic-api-key');
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = (category: string) => {
    setSelectedCategory(category);
    setScreen('length-select');
  };

  const selectLength = async (length: string) => {
    setConversationLength(length);
    setTurnCount(0);
    const initialMessage = `よし、【${selectedCategory}】ね。了解よ。${length === 'short' ? 'サクッと' : 'じっくり'}いきましょ。\n\nあんた、まずは何が起きたのか教えてちょうだい。先輩も同じような失敗、山ほどしてきたから。`;
    setMessages([{ role: 'assistant', content: initialMessage, mood: 'neutral' }]);
    setScreen('chat');
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;
    if (!apiKey) {
      alert('APIキーが設定されていません。設定画面からAnthropic APIキーを登録してください。');
      return;
    }

    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsTyping(true);
    const newTurnCount = turnCount + 1;
    setTurnCount(newTurnCount);
    const maxTurns = conversationLength === 'short' ? 7 : 15;
    const isNearEnd = newTurnCount >= maxTurns - 2;

    try {
      const conversationHistory = newMessages.map(m => ({ role: m.role, content: m.content }));
      const systemPrompt = `あなたはマツコ・デラックス風の先輩PMです。後輩PMの相談に乗り、プロフェッショナルな観点から深掘り質問をしてください。

【人格設定】
- 率直でズバッと本音を言うが、根底には優しさと共感がある
- 「あんた」「〜じゃない」「〜でしょ」などの口調
- 先輩が後輩を育てる愛情を持った話し方
- 失敗を責めるより「誰でも通る道よ」と受け止める

【深掘りの観点】
- 後輩の回答内容をよく理解し、それに応じた質問をする
- PMとしての重要な観点（ステークホルダー、リスク管理、コミュニケーション、スケジュール、品質）から質問
- 表面的な事実だけでなく、背景や感情、判断理由も引き出す
- 「なぜそう思ったの?」「他の選択肢は考えた?」など掘り下げる

【現在の状況】
- カテゴリ: ${selectedCategory}
- 会話スタイル: ${conversationLength === 'short' ? 'サクッと（7往復目安）' : 'じっくり（15往復目安）'}
- 現在のターン数: ${newTurnCount}/${maxTurns}

${isNearEnd ? '【重要】そろそろ会話を締めくくる段階です。最後の質問として、「結果はどうだった?」「今後どうしたい?」などを聞いてください。' : ''}

【重要：感情タグ】
回答の最後に、必ず以下の形式で感情タグを付けてください：
[EMOTION:感情名]

使用可能な感情：
- neutral: 普通の会話
- smile: 励ます、ポジティブ
- praise: 褒める、称賛
- worry: 心配、共感
- serious: 真剣、重要な指摘
- surprise: 驚き
- kind: 優しく諭す
- tired: 呆れる、ため息
- thinking: 考えさせる質問
- understand: 理解、納得

例：「そうね、その判断は難しかったでしょうね。でも、あんたなりに頑張ったじゃない。[EMOTION:kind]」

次の質問を1つだけ、自然な会話形式で返してください。質問は具体的で、後輩の回答内容に基づいたものにしてください。`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          messages: conversationHistory
        })
      });

      if (!response.ok) throw new Error('API呼び出しに失敗しました');
      const data = await response.json();
      let aiResponse = data.content[0].text;
      
      let mood = 'neutral';
      const emotionMatch = aiResponse.match(/\[EMOTION:(\w+)\]/);
      if (emotionMatch) {
        mood = emotionMatch[1];
        aiResponse = aiResponse.replace(/\[EMOTION:\w+\]/, '').trim();
      }
      
      setMessages([...newMessages, { role: 'assistant', content: aiResponse, mood }]);
      
      if (newTurnCount >= maxTurns) {
        setTimeout(() => generateFinalAdvice(newMessages), 2000);
      }
    } catch (error: any) {
      alert('エラーが発生しました: ' + error.message);
    } finally {
      setIsTyping(false);
    }
  };

  const generateFinalAdvice = async (conversationMessages: any[]) => {
    setIsTyping(true);
    try {
      const conversationHistory = conversationMessages.map(m => ({ role: m.role, content: m.content }));
      const systemPrompt = `あなたはマツコ・デラックス風の先輩PMです。後輩PMとの会話を総括し、アドバイスとベストプラクティスを提示してください。

【出力形式】
まぁ、よく話してくれたわね。あんたの状況、よくわかったわよ。

**先輩からのアドバイス**
（後輩の状況を踏まえた具体的なアドバイス）

**具体的な改善策**
・（改善策1）
・（改善策2）
・（改善策3）

**ベストプラクティス**
（PMプロとしてのベストプラクティスを3つ程度）

---

（最後に後輩を褒めて励ますメッセージ）

【トーン】
- 優しく、でも的確に
- 具体的で実践的な内容
- 前向きで励ます締めくくり

【重要：感情タグ】
回答の最後に必ず感情タグを付けてください：[EMOTION:praise]`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: systemPrompt,
          messages: conversationHistory
        })
      });

      const data = await response.json();
      let finalAdvice = data.content[0].text;
      
      let mood = 'praise';
      const emotionMatch = finalAdvice.match(/\[EMOTION:(\w+)\]/);
      if (emotionMatch) {
        mood = emotionMatch[1];
        finalAdvice = finalAdvice.replace(/\[EMOTION:\w+\]/, '').trim();
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: finalAdvice, mood }]);
    } catch (error: any) {
      alert('アドバイス生成に失敗しました: ' + error.message);
    } finally {
      setIsTyping(false);
    }
  };

  const summarizeAndShare = async () => {
    const summary = `【${selectedCategory}】のナレッジ共有\n\n${messages.filter((m: any) => m.role === 'assistant').pop()?.content}`;
    
    if (!apiKey) {
      alert('APIキーが設定されていません');
      return;
    }

    try {
      const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
      const extractPrompt = `以下のPM相談の会話から、以下の情報を抽出してJSON形式で返してください：

会話:
${conversationText}

抽出する情報:
- industry: クライアントの業種（会話に明示されていない場合は"不明"）
- issue: 主な課題や問題（30文字以内で簡潔に）
- solution: どう解決したか、または解決のアドバイス（50文字以内で簡潔に）

必ず以下の形式のJSONのみを返してください:
{"industry": "業種", "issue": "課題の概要", "solution": "解決策の概要"}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          messages: [{ role: 'user', content: extractPrompt }]
        })
      });

      const data = await response.json();
      const extractedText = data.content[0].text.trim();
      let extractedInfo;
      
      try {
        const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
        extractedInfo = jsonMatch ? JSON.parse(jsonMatch[0]) : {
          industry: '不明',
          issue: '詳細は会話履歴を参照',
          solution: '詳細は会話履歴を参照'
        };
      } catch (e) {
        extractedInfo = {
          industry: '不明',
          issue: '詳細は会話履歴を参照',
          solution: '詳細は会話履歴を参照'
        };
      }

      const newHistoryItem = {
        id: Date.now(),
        category: selectedCategory,
        date: new Date().toLocaleDateString('ja-JP'),
        industry: extractedInfo.industry,
        issue: extractedInfo.issue,
        solution: extractedInfo.solution,
        summary: summary,
        messages: messages
      };

      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('pm-knowledge-history', JSON.stringify(updatedHistory));

      if (slackWebhook) {
        try {
          await fetch(slackWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: summary })
          });
          alert('Slackに投稿しました!');
        } catch (error: any) {
          alert('Slack投稿に失敗しました: ' + error.message);
        }
      } else {
        alert('サマライズを保存しました!');
      }
    } catch (error) {
      console.error('情報抽出エラー:', error);
      const newHistoryItem = {
        id: Date.now(),
        category: selectedCategory,
        date: new Date().toLocaleDateString('ja-JP'),
        industry: '不明',
        issue: '詳細は会話履歴を参照',
        solution: '詳細は会話履歴を参照',
        summary: summary,
        messages: messages
      };

      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('pm-knowledge-history', JSON.stringify(updatedHistory));
      alert('サマライズを保存しました!');
    }

    setScreen('category');
    setMessages([]);
    setTurnCount(0);
  };

  const saveSettings = () => {
    localStorage.setItem('slack-webhook', slackWebhook);
    localStorage.setItem('anthropic-api-key', apiKey);
    setShowSettings(false);
    alert('設定を保存しました!');
  };

  if (showSettings) {
    return (
      <div className="min-h-screen p-6" style={noiseBackground}>
        <FontLoader />
        <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-10 border border-purple-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl text-gray-800 flex items-center gap-3 tracking-wide" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>
              <Settings className="w-7 h-7 text-purple-500" />
              設定
            </h2>
            <button 
              onClick={() => setShowSettings(false)} 
              className="text-gray-400 hover:text-gray-600 text-2xl font-light transition-all duration-300 hover:scale-110 hover:rotate-90"
              style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}
            >
              ✕
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-600 mb-3 tracking-wide" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>Anthropic APIキー（必須）</label>
              <input 
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                placeholder="sk-ant-..." 
                className="w-full px-5 py-3 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300" 
                style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}
              />
              <div className="mt-3 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
                <p className="text-sm text-gray-600 mb-2 tracking-wide" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>📝 APIキーの取得方法：</p>
                <ol className="text-sm text-gray-500 space-y-1 ml-4" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>
                  <li>1. <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline">console.anthropic.com</a> にアクセス</li>
                  <li>2. アカウント作成（初回$5無料クレジット）</li>
                  <li>3. 「API Keys」から「Create Key」</li>
                  <li>4. 生成されたキーをコピーして貼り付け</li>
                </ol>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-3 tracking-wide" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>Slack Webhook URL（任意）</label>
              <input 
                type="text" 
                value={slackWebhook} 
                onChange={(e) => setSlackWebhook(e.target.value)} 
                placeholder="https://hooks.slack.com/services/..." 
                className="w-full px-5 py-3 border border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-300" 
                style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}
              />
            </div>
            <button 
              onClick={saveSettings} 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 tracking-wide shadow-lg" 
              style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}
            >
              保存する
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="min-h-screen p-6" style={noiseBackground}>
        <FontLoader />
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-10 border border-purple-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl text-gray-800 flex items-center gap-3 tracking-wide" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>
                <Archive className="w-7 h-7 text-purple-500" />
                過去のナレッジ
              </h2>
              <button 
                onClick={() => setShowHistory(false)} 
                className="text-gray-400 hover:text-gray-600 text-2xl transition-all duration-300 hover:scale-110 hover:rotate-90"
                style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}
              >
                ✕
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-12 text-base tracking-wide" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>まだナレッジがありません</p>
            ) : (
              <div className="space-y-5">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    className="border border-purple-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50/30 to-pink-50/30 hover:scale-[1.01]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-4 py-2 rounded-full tracking-wide" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-2" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>
                        <Calendar className="w-4 h-4" />
                        {item.date}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-purple-600 min-w-[80px]" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700 }}>業種</span>
                        <span className="text-sm text-gray-700" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>
                          {item.industry || '不明'}
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-purple-600 min-w-[80px]" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700 }}>課題</span>
                        <span className="text-sm text-gray-700" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>
                          {item.issue || '詳細は会話履歴を参照'}
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-purple-600 min-w-[80px]" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700 }}>解決策</span>
                        <span className="text-sm text-gray-700" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>
                          {item.solution || '詳細は会話履歴を参照'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'length-select') {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={noiseBackground}>
        <FontLoader />
        <div className="max-w-2xl w-full">
          <button 
            onClick={() => setScreen('category')} 
            className="mb-6 text-stone-600 text-sm font-medium transition-all px-5 py-2.5 border-2 border-stone-300 rounded-full duration-300"
            style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.backgroundColor = '#fafaf9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ← TOPに戻る
          </button>

          <div className="flex justify-center mb-6">
            <div className="relative inline-block" style={{ transform: 'rotate(-2deg)' }}>
              <div className="bg-white px-8 py-4 rounded-2xl relative">
                <p className="text-lg text-stone-700 whitespace-nowrap font-medium" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 500 }}>
                  今日あんた忙しいの？
                </p>
                <div className="absolute -bottom-3 left-12 w-6 h-6 bg-white rotate-45" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => selectLength('short')} 
              className="w-full p-8 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-2xl transition-all duration-300"
              style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.15)';
                e.currentTarget.style.backgroundImage = 'linear-gradient(to right, rgb(59, 130, 246), rgb(34, 211, 238))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundImage = 'linear-gradient(to right, rgb(96, 165, 250), rgb(103, 232, 249))';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98) translateY(0)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)';
              }}
            >
              <div className="text-2xl mb-2 tracking-wide font-medium">今日あんまり時間ないんだよね</div>
              <div className="text-sm opacity-90">7往復</div>
            </button>
            <button 
              onClick={() => selectLength('long')} 
              className="w-full p-8 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-2xl transition-all duration-300"
              style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.15)';
                e.currentTarget.style.backgroundImage = 'linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundImage = 'linear-gradient(to right, rgb(192, 132, 252), rgb(244, 114, 182))';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98) translateY(0)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)';
              }}
            >
              <div className="text-2xl mb-2 tracking-wide font-medium">時間あるよ</div>
              <div className="text-sm opacity-90">15往復</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'chat') {
    const maxTurns = conversationLength === 'short' ? 7 : 15;
    const isComplete = turnCount >= maxTurns && messages[messages.length - 1]?.role === 'assistant';

    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50 flex flex-col">
        <div className="bg-white/60 backdrop-blur-md shadow-sm border-b border-stone-200/50 p-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl text-stone-700 tracking-wider" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>あんたの相談、聞くわよ</h1>
              <p className="text-xs text-stone-500 mt-2 tracking-widest" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}>{selectedCategory} | {turnCount}/{maxTurns}ターン</p>
            </div>
            <button 
              onClick={() => { 
                setScreen('category'); 
                setMessages([]); 
                setTurnCount(0); 
              }} 
              className="text-stone-600 hover:text-stone-800 text-sm font-medium transition-all px-4 py-2 border border-stone-300 rounded-full hover:bg-stone-50 hover:scale-105 hover:shadow-md duration-300"
              style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}
            >
              TOPに戻る
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <div className="max-w-3xl mx-auto space-y-10">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-6 items-start ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="flex-1 max-w-xl">
                  <div 
                    className={`px-8 py-6 transition-all duration-300 ${
                      msg.role === 'user'
                        ? 'bg-white/80 text-stone-700'
                        : 'bg-white/90 text-stone-800'
                    }`}
                    style={{
                      borderRadius: msg.role === 'user' 
                        ? '24px 24px 4px 24px'
                        : '24px 24px 24px 4px',
                      border: msg.role === 'user'
                        ? '1.5px solid rgba(120, 113, 108, 0.15)'
                        : '1.5px solid rgba(168, 162, 158, 0.2)',
                      fontFamily: 'Quicksand, sans-serif',
                      fontWeight: 400
                    }}
                  >
                    <pre className="whitespace-pre-wrap leading-loose tracking-wider text-sm" style={{ fontFamily: 'inherit' }}>{msg.content}</pre>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-6 items-start">
                <div className="flex-1 max-w-xl">
                  <div className="bg-white/90 px-8 py-6" style={{
                    borderRadius: '24px 24px 24px 4px',
                    border: '1.5px solid rgba(168, 162, 158, 0.2)'
                  }}>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md border-t border-stone-200/50 p-8">
          <div className="max-w-3xl mx-auto">
            {isComplete && (
              <button 
                onClick={summarizeAndShare} 
                className="w-full mb-6 bg-gradient-to-r from-stone-600 to-stone-700 text-white py-4 rounded-full hover:from-stone-700 hover:to-stone-800 font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 tracking-widest text-sm" 
                style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}
              >
                <Sparkles className="w-4 h-4" />
                サマライズしてシェアする
              </button>
            )}
            <div className="flex gap-4">
              <input 
                type="text" 
                value={userInput} 
                onChange={(e) => setUserInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} 
                placeholder="メッセージを入力..." 
                className="flex-1 px-6 py-4 border border-stone-200 rounded-full focus:ring-1 focus:ring-stone-300 focus:border-stone-300 bg-white/80 text-sm tracking-wider transition-all" 
                style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }} 
                disabled={isTyping} 
              />
              <button 
                onClick={handleSend} 
                disabled={isTyping || !userInput.trim()} 
                className="bg-stone-600 text-white px-8 py-4 rounded-full hover:bg-stone-700 disabled:opacity-30 shadow-sm hover:shadow-md transition-all hover:scale-105 duration-300"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex items-center relative" style={{...noiseBackground, overflow: 'hidden'}}>
      <FontLoader />
      <AnimationStyles />
      
      <div className="absolute inset-0 pointer-events-none" style={{zIndex: 1}}>
        {pmQuestions.map((question, index) => {
          const randomStart = -50 + (index * 47) % 200;
          return (
            <FloatingQuestion 
              key={index}
              text={question.text}
              color={question.color}
              delay={0}
              duration={35 + (index % 7) * 5}
              yPosition={5 + (index * 7) % 85}
              startOffset={randomStart}
            />
          );
        })}
      </div>
      
      <div className="max-w-6xl mx-auto w-full relative" style={{zIndex: 10}}>
        <div className="mb-16">
          <h1 className="text-8xl md:text-9xl text-stone-800 my-16 tracking-tight font-bold text-center" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>
            PM Sodanjo
          </h1>
          
          <div className="flex justify-start mb-6 max-w-6xl mx-auto">
            <div className="relative inline-block">
              <div className="bg-white px-8 py-4 rounded-2xl relative">
                <p className="text-lg text-stone-700 font-medium" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 500 }}>
                  聞かせなさいよ、あんたの悩み。<br />
                  その相談が皆を成長させるんだから！
                </p>
                <div className="absolute -bottom-3 left-12 w-6 h-6 bg-white rotate-45"></div>
              </div>
            </div>
          </div>
          
          {/* サボテンアイコン */}
          <div className="flex justify-center mb-6">
            <div style={{ animation: 'float 3s ease-in-out infinite', background: 'transparent' }}>
              <img 
                src="/images/cactus.png"
                alt="サボテン先輩"
                style={{ width: '200px', height: '200px', objectFit: 'contain', background: 'transparent' }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 mb-8 relative max-w-6xl mx-auto">
          <div className="absolute -top-3 left-12 w-6 h-6 bg-white rotate-45"></div>
          
          <h2 className="text-lg text-gray-800 mb-8 tracking-wide font-medium text-left" style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 500, paddingLeft: '0px' }}>
            どんなカテゴリで相談したいのよ？
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category];
              const bgColor = categoryColors[category];
              return (
                <button 
                  key={category} 
                  onClick={() => startConversation(category)} 
                  className="p-6 border-2 rounded-2xl bg-white transition-all duration-300 group"
                  style={{ 
                    fontFamily: 'Quicksand, sans-serif', 
                    fontWeight: 400,
                    borderColor: bgColor
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
                    e.currentTarget.style.backgroundColor = bgColor;
                    const icon = e.currentTarget.querySelector('svg');
                    const text = e.currentTarget.querySelector('span');
                    if (icon) icon.style.color = 'white';
                    if (text) text.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    const icon = e.currentTarget.querySelector('svg');
                    const text = e.currentTarget.querySelector('span');
                    if (icon) (icon).style.color = bgColor;
                    if (text) (text as HTMLElement).style.color = bgColor;
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.95) translateY(0)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <IconComponent 
                      className="transition-all duration-300" 
                      strokeWidth={2.5}
                      style={{ color: bgColor }}
                    />
                    <span 
                      className="text-sm font-bold tracking-wide transition-all duration-300" 
                      style={{ 
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        color: bgColor
                      }}
                    >
                      {category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => setShowHistory(true)} 
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl text-gray-700 border-2 border-stone-200 transition-all duration-300" 
            style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
              e.currentTarget.style.borderColor = '#a8a29e';
              e.currentTarget.style.backgroundColor = '#fafaf9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e7e5e4';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95) translateY(0)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
            }}
          >
            <Archive className="w-5 h-5 text-stone-500" />
            <span className="tracking-wide">過去のナレッジ</span>
          </button>
          <button 
            onClick={() => setShowSettings(true)} 
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl text-gray-700 border-2 border-stone-200 transition-all duration-300" 
            style={{ fontFamily: 'Quicksand, sans-serif', fontWeight: 400 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
              e.currentTarget.style.borderColor = '#a8a29e';
              e.currentTarget.style.backgroundColor = '#fafaf9';
              const icon = e.currentTarget.querySelector('svg');
              if (icon) (icon).style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e7e5e4';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              const icon = e.currentTarget.querySelector('svg');
              if (icon) (icon).style.transform = 'rotate(0deg)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95) translateY(0)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
            }}
          >
            <Settings className="w-5 h-5 text-stone-500 transition-all duration-300" />
            <span className="tracking-wide">設定</span>
          </button>
        </div>
      </div>
    </div>
  );
}