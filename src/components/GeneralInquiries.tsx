import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface GeneralInquiriesProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeneralInquiries: React.FC<GeneralInquiriesProps> = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) {
      return;
    }

    const inquiryMessage = `
📧 GENERAL INQUIRY - Botika RBT
${subject.trim() ? `\n📌 Subject: ${subject}` : ''}

💬 Message:
${message}

Thank you for contacting Botika RBT! We'll get back to you soon. 💊
    `.trim();

    const encodedMessage = encodeURIComponent(inquiryMessage);
    const messengerUrl = `https://m.me/Botika.RBT?text=${encodedMessage}`;
    
    window.open(messengerUrl, '_blank');
    
    // Reset form
    setSubject('');
    setMessage('');
    onClose();
  };

  const isFormValid = message.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-botika-light rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-botika-light border-b border-botika-border p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-inter font-semibold text-botika-dark">General Inquiries</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-botika-beige rounded-full transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-botika-dark mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-botika-border rounded-lg focus:ring-2 focus:ring-botika-accent focus:border-botika-accent transition-all duration-200 bg-white text-botika-dark placeholder-gray-400"
              placeholder="Enter inquiry subject (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-botika-dark mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-botika-border rounded-lg focus:ring-2 focus:ring-botika-accent focus:border-botika-accent transition-all duration-200 bg-white text-botika-dark placeholder-gray-400 resize-none"
              placeholder="Type your message here..."
              rows={8}
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-botika-border">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg border border-botika-border text-botika-dark hover:bg-botika-beige transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!isFormValid}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                isFormValid
                  ? 'bg-botika-accent text-white hover:bg-botika-hover'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="h-5 w-5" />
              <span>Send to Messenger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInquiries;

