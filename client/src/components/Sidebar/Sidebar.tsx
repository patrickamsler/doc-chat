import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, MoreVertical, Trash2, Upload } from 'lucide-react';
import { ChatInfo } from '../../types/apiTypes';
import { deleteChat, deleteChatHistory } from '../../services/api';
import DropdownMenu, { MenuItem } from '../common/DropdownMenu/DropdownMenu';
import ConfirmDialog from '../common/ConfirmDialog/ConfirmDialog';
import {
  DocumentIcon,
  DocumentInfo,
  DocumentItem,
  DocumentItemContent,
  DocumentList,
  DocumentTitle,
  EmptyIconWrapper,
  EmptyState,
  EmptySubtitle,
  EmptyTitle,
  MenuButton,
  SidebarContainer,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  Timestamp,
  UploadBtn,
} from './Sidebar.styles';

interface SidebarProps {
  isOpen: boolean;
  isUploading: boolean;
  documents: ChatInfo[];
  onFileUploadClick: () => void;
  onChatDeleted?: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({isOpen, isUploading, documents, onFileUploadClick, onChatDeleted}) => {
  const navigate = useNavigate();
  const {chatId} = useParams<{ chatId: string }>();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const menuButtonRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

  // Initialize refs for each document
  useEffect(() => {
    documents.forEach(doc => {
      if (!menuButtonRefs.current[doc.chatId]) {
        menuButtonRefs.current[doc.chatId] = React.createRef();
      }
    });
  }, [documents]);

  const handleDocumentClick = async (doc: ChatInfo) => {
    try {
      navigate(`/chat/${doc.chatId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMenuClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === chatId ? null : chatId);
  };

  const handleClearHistory = async (chatId: string) => {
    setOpenMenuId(null);
    try {
      await deleteChatHistory(chatId);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  const handleDeleteChatClick = (chatId: string) => {
    setOpenMenuId(null);
    setChatToDelete(chatId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;

    try {
      await deleteChat(chatToDelete);
      onChatDeleted?.(chatToDelete);
      setShowDeleteDialog(false);
      setChatToDelete(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const cancelDeleteChat = () => {
    setShowDeleteDialog(false);
    setChatToDelete(null);
  };

  return (
      <SidebarContainer $isOpen={isOpen}>
        <SidebarHeader>
          <UploadBtn onClick={onFileUploadClick} disabled={isUploading}>
            <Upload style={{width: '1rem', height: '1rem'}}/>
            {isUploading ? 'Uploading...' : 'Upload PDF'}
          </UploadBtn>
        </SidebarHeader>

        <SidebarContent>
          <SidebarTitle>Your Documents</SidebarTitle>
          {documents.length > 0 ? (
              <DocumentList>
                {documents.map(doc => {
                  const menuItems: MenuItem[] = [
                    {
                      label: 'Clear chat history',
                      onClick: () => handleClearHistory(doc.chatId),
                      icon: <Trash2 size={16}/>,
                      variant: 'default'
                    },
                    {
                      label: 'Delete chat',
                      onClick: () => handleDeleteChatClick(doc.chatId),
                      icon: <Trash2 size={16}/>,
                      variant: 'danger'
                    }
                  ];

                  return (
                      <DocumentItem
                          key={doc.chatId}
                          $isSelected={chatId === doc.chatId}
                      >
                        <DocumentItemContent onClick={() => handleDocumentClick(doc)}>
                          <DocumentIcon $isSelected={chatId === doc.chatId}/>
                          <DocumentInfo>
                            <DocumentTitle $isSelected={chatId === doc.chatId} title={doc.fileName}>
                              {doc.fileName}
                            </DocumentTitle>
                            <Timestamp>
                              {new Date(doc.createdAt).toISOString().split('T')[0]}
                            </Timestamp>
                          </DocumentInfo>
                        </DocumentItemContent>

                        <MenuButton
                            ref={menuButtonRefs.current[doc.chatId]}
                            onClick={(e) => handleMenuClick(e, doc.chatId)}
                            role="button"
                            tabIndex={0}
                            aria-label="Document options"
                        >
                          <MoreVertical/>
                        </MenuButton>

                        <DropdownMenu
                            isOpen={openMenuId === doc.chatId}
                            onClose={() => setOpenMenuId(null)}
                            triggerRef={menuButtonRefs.current[doc.chatId]}
                            items={menuItems}
                        />
                      </DocumentItem>
                  );
                })}
              </DocumentList>
          ) : (
              <EmptyState>
                <EmptyIconWrapper>
                  <FileText style={{width: '2rem', height: '2rem', color: '#9ca3af'}}/>
                </EmptyIconWrapper>
                <EmptyTitle>No documents yet</EmptyTitle>
                <EmptySubtitle>Upload a PDF to get started</EmptySubtitle>
              </EmptyState>
          )}
        </SidebarContent>

        <ConfirmDialog
            isOpen={showDeleteDialog}
            title="Delete Chat"
            message="Are you sure you want to delete this chat?"
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
            onConfirm={confirmDeleteChat}
            onCancel={cancelDeleteChat}
        />
      </SidebarContainer>
  );
};

export default Sidebar;