import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { MessageCircle, AtSign, Heart, Share2, Pin, X } from 'lucide-react';

export default function RealtimeCollaboration() {
  const [activeProperty, setActiveProperty] = useState('123-main-st');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Sarah Johnson',
      avatar: 'SJ',
      content: '@Mike needs to schedule the gas safety inspection before end of month',
      timestamp: '2 hours ago',
      likes: 3,
      mentions: ['Mike']
    },
    {
      id: 2,
      author: 'Mike Davis',
      avatar: 'MD',
      content: 'Already booked for 15th. Will send confirmation to tenant.',
      timestamp: '1 hour ago',
      likes: 1,
      mentions: []
    }
  ]);
  const [newComment, setNewComment] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);

  const properties = [
    { id: '123-main-st', name: '123 Main Street', region: 'London', users: 3 },
    { id: '456-oak-ave', name: '456 Oak Avenue', region: 'Manchester', users: 2 },
    { id: '789-pine-rd', name: '789 Pine Road', region: 'Bristol', users: 4 }
  ];

  const teamMembers = [
    { name: 'Sarah Johnson', initials: 'SJ' },
    { name: 'Mike Davis', initials: 'MD' },
    { name: 'Emma Wilson', initials: 'EW' },
    { name: 'James Brown', initials: 'JB' }
  ];

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const mentions = newComment.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];
    
    setComments([
      ...comments,
      {
        id: comments.length + 1,
        author: 'You',
        avatar: 'YO',
        content: newComment,
        timestamp: 'just now',
        likes: 0,
        mentions
      }
    ]);
    setNewComment('');
    setShowMentions(false);
  };

  const handleMentionSelect = (name) => {
    const lastAtIndex = newComment.lastIndexOf('@');
    const beforeMention = newComment.substring(0, lastAtIndex);
    setNewComment(`${beforeMention}@${name} `);
    setShowMentions(false);
    setMentionSearch('');
  };

  const filteredMembers = teamMembers.filter(m =>
    m.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Property List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {properties.map(prop => (
                <button
                  key={prop.id}
                  onClick={() => setActiveProperty(prop.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    activeProperty === prop.id
                      ? 'bg-blue-100 border border-blue-500'
                      : 'hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <p className="font-semibold text-sm text-slate-900">{prop.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-500">{prop.region}</p>
                    <Badge className="text-xs bg-blue-100 text-blue-800">{prop.users} online</Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Collaboration Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Property Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {properties.find(p => p.id === activeProperty)?.name}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">Real-time collaboration board</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[
                      { initials: 'SJ', color: 'bg-blue-500' },
                      { initials: 'MD', color: 'bg-green-500' },
                      { initials: 'EW', color: 'bg-purple-500' }
                    ].map((user, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 ${user.color} rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white`}
                        title={user.initials}
                      >
                        {user.initials}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-600 ml-2">3 editing</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Pin className="w-4 h-4" />
              Pin
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Comments ({comments.length})
            </Button>
          </div>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comments & Mentions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Comment Thread */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map(comment => (
                  <div key={comment.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {comment.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-slate-900">{comment.author}</p>
                          <p className="text-xs text-slate-500">{comment.timestamp}</p>
                        </div>
                        <p className="text-sm text-slate-700 mt-2">
                          {comment.content.split(/(@\w+)/).map((part, i) => 
                            part.startsWith('@') ? (
                              <span key={i} className="bg-blue-100 text-blue-800 font-semibold px-1 rounded">
                                {part}
                              </span>
                            ) : part
                          )}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600">
                            <Heart className="w-3 h-3" />
                            {comment.likes > 0 && comment.likes}
                          </button>
                          <button className="text-xs text-slate-500 hover:text-slate-700">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="relative">
                  <Textarea
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      const atIndex = e.target.value.lastIndexOf('@');
                      if (atIndex !== -1) {
                        const afterAt = e.target.value.substring(atIndex + 1);
                        setMentionSearch(afterAt.split(' ')[0]);
                        setShowMentions(true);
                      } else {
                        setShowMentions(false);
                      }
                    }}
                    placeholder="Comment... Type @ to mention team members"
                    className="min-h-20"
                  />

                  {/* Mention Dropdown */}
                  {showMentions && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                      <div className="p-2 space-y-1 max-h-40 overflow-y-auto">
                        {filteredMembers.length > 0 ? (
                          filteredMembers.map(member => (
                            <button
                              key={member.name}
                              onClick={() => handleMentionSelect(member.name.split(' ')[0])}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm"
                            >
                              <p className="font-medium text-slate-900">{member.name}</p>
                            </button>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 px-3 py-2">No matches</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddComment} className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}