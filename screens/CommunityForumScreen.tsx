import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  avatar?: string;
  joinDate: string;
  reputation: number;
  badges: Badge[];
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface ForumPost {
  id: string;
  authorId: string;
  author: User;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  replies: number;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  isSolved: boolean;
  lastActivity: string;
  lastReplyBy?: User;
}

interface Reply {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  parentReplyId?: string;
  isAnswer: boolean;
  images: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  postCount: number;
  color: string;
}

const CommunityForumScreen: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'replies' | 'views'>('latest');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');

  // New post form data
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
  });

  // Sample current user
  const currentUser: User = {
    id: 'user_001',
    name: 'Sarah Johnson',
    joinDate: '2023-06-15',
    reputation: 245,
    badges: [
      { id: 'badge_001', name: 'Helpful', icon: '🏆', description: 'Provided many helpful answers' },
      { id: 'badge_002', name: 'Pet Expert', icon: '🐾', description: 'Expert in pet care topics' },
    ],
  };

  // Sample categories
  const sampleCategories: Category[] = [
    {
      id: 'general',
      name: 'General Discussion',
      description: 'General pet-related topics and discussions',
      icon: '💬',
      postCount: 156,
      color: '#007bff',
    },
    {
      id: 'adoption',
      name: 'Adoption Stories',
      description: 'Share your adoption experiences and success stories',
      icon: '❤️',
      postCount: 89,
      color: '#dc3545',
    },
    {
      id: 'training',
      name: 'Pet Training',
      description: 'Tips, tricks, and advice for training your pets',
      icon: '🎓',
      postCount: 134,
      color: '#28a745',
    },
    {
      id: 'health',
      name: 'Pet Health',
      description: 'Health-related questions and veterinary advice',
      icon: '🏥',
      postCount: 201,
      color: '#ffc107',
    },
    {
      id: 'rescue',
      name: 'Rescue & Foster',
      description: 'Discussions about pet rescue and fostering',
      icon: '🆘',
      postCount: 67,
      color: '#6f42c1',
    },
    {
      id: 'photos',
      name: 'Pet Photos',
      description: 'Share adorable photos of your pets',
      icon: '📸',
      postCount: 312,
      color: '#fd7e14',
    },
  ];

  // Sample posts
  const samplePosts: ForumPost[] = [
    {
      id: 'post_001',
      authorId: 'user_002',
      author: {
        id: 'user_002',
        name: 'Mike Wilson',
        joinDate: '2023-04-10',
        reputation: 156,
        badges: [
          { id: 'badge_003', name: 'Active Member', icon: '⭐', description: 'Active community member' },
        ],
      },
      title: 'First-time dog owner - need advice on house training',
      content: 'Hi everyone! I just adopted a 8-week-old Golden Retriever puppy named Max. This is my first time owning a dog and I\'m struggling with house training. He seems to understand going outside sometimes but still has accidents indoors. Any tips from experienced dog owners? How long does it typically take to fully house train a puppy?',
      category: 'training',
      tags: ['puppy', 'house-training', 'first-time-owner', 'golden-retriever'],
      createdAt: '2024-01-15T09:30:00Z',
      updatedAt: '2024-01-15T09:30:00Z',
      likes: 12,
      replies: 8,
      views: 45,
      isPinned: false,
      isLocked: false,
      isSolved: false,
      lastActivity: '2024-01-15T14:22:00Z',
      lastReplyBy: {
        id: 'user_004',
        name: 'Jessica Miller',
        joinDate: '2023-02-20',
        reputation: 89,
        badges: [],
      },
    },
    {
      id: 'post_002',
      authorId: 'user_003',
      author: {
        id: 'user_003',
        name: 'Emily Davis',
        joinDate: '2023-05-22',
        reputation: 203,
        badges: [
          { id: 'badge_004', name: 'Cat Whisperer', icon: '🐱', description: 'Expert in cat behavior' },
        ],
      },
      title: 'Success Story: Luna\'s adoption journey from shelter to home',
      content: 'I wanted to share Luna\'s amazing transformation! When I first met her at the shelter 6 months ago, she was so scared and wouldn\'t let anyone touch her. The staff told me she had been there for 8 months and was considered "unadoptable" by many visitors. But something about her spoke to me. Today, she\'s the most loving, confident cat who greets everyone at the door. Sometimes patience and love is all they need. Here are some photos of her journey...',
      category: 'adoption',
      tags: ['success-story', 'shelter-cat', 'transformation', 'persian'],
      createdAt: '2024-01-14T16:45:00Z',
      updatedAt: '2024-01-14T16:45:00Z',
      likes: 34,
      replies: 15,
      views: 128,
      isPinned: true,
      isLocked: false,
      isSolved: false,
      lastActivity: '2024-01-15T11:30:00Z',
      lastReplyBy: {
        id: 'user_005',
        name: 'Robert Brown',
        joinDate: '2023-08-05',
        reputation: 67,
        badges: [],
      },
    },
    {
      id: 'post_003',
      authorId: 'user_006',
      author: {
        id: 'user_006',
        name: 'Lisa Chen',
        joinDate: '2023-03-18',
        reputation: 134,
        badges: [
          { id: 'badge_005', name: 'Health Expert', icon: '⚕️', description: 'Knowledgeable about pet health' },
        ],
      },
      title: 'URGENT: Lost dog in downtown area - please help!',
      content: 'My dog Charlie escaped this morning around 8 AM near Downtown Park. He\'s a medium-sized Beagle, brown and white, wearing a blue collar with tags. He\'s very friendly but might be scared. Last seen heading towards Main Street. If you see him, please don\'t chase - call me immediately at 555-0199. I\'m offering a reward for his safe return. Please share this post!',
      category: 'general',
      tags: ['lost-pet', 'urgent', 'beagle', 'downtown', 'reward'],
      createdAt: '2024-01-15T10:15:00Z',
      updatedAt: '2024-01-15T10:15:00Z',
      likes: 67,
      replies: 23,
      views: 234,
      isPinned: false,
      isLocked: false,
      isSolved: false,
      lastActivity: '2024-01-15T15:45:00Z',
      lastReplyBy: {
        id: 'user_007',
        name: 'David Thompson',
        joinDate: '2023-07-12',
        reputation: 45,
        badges: [],
      },
    },
    {
      id: 'post_004',
      authorId: 'user_008',
      author: {
        id: 'user_008',
        name: 'Maria Rodriguez',
        joinDate: '2023-01-30',
        reputation: 289,
        badges: [
          { id: 'badge_006', name: 'Rescue Hero', icon: '🦸', description: 'Active in pet rescue efforts' },
          { id: 'badge_007', name: 'Community Leader', icon: '👑', description: 'Community moderator' },
        ],
      },
      title: 'Best practices for introducing a new cat to existing pets',
      content: 'For those bringing home a new cat to a multi-pet household, here are some tried-and-true methods I\'ve learned through fostering 15+ cats over the years:\n\n1. Separate spaces initially\n2. Scent swapping with blankets\n3. Feeding on opposite sides of a door\n4. Supervised short meetings\n5. Gradual increase in time together\n\nThe process usually takes 2-4 weeks but can vary greatly depending on the personalities involved. What methods have worked for you?',
      category: 'training',
      tags: ['multi-pet', 'introduction', 'cats', 'behavior', 'tips'],
      createdAt: '2024-01-13T13:20:00Z',
      updatedAt: '2024-01-14T09:15:00Z',
      likes: 28,
      replies: 12,
      views: 89,
      isPinned: false,
      isLocked: false,
      isSolved: true,
      lastActivity: '2024-01-14T18:30:00Z',
      lastReplyBy: {
        id: 'user_009',
        name: 'Tom Anderson',
        joinDate: '2023-09-08',
        reputation: 78,
        badges: [],
      },
    },
    {
      id: 'post_005',
      authorId: 'user_010',
      author: {
        id: 'user_010',
        name: 'Amanda White',
        joinDate: '2023-11-03',
        reputation: 23,
        badges: [],
      },
      title: 'Vet bills are overwhelming - any advice on pet insurance?',
      content: 'My 3-year-old dog was recently diagnosed with hip dysplasia and the treatment costs are adding up quickly. I\'m looking into pet insurance but feeling overwhelmed by all the options. Does anyone have experience with pet insurance? Which companies do you recommend? What should I look for in a policy? Any advice would be greatly appreciated.',
      category: 'health',
      tags: ['pet-insurance', 'veterinary-costs', 'hip-dysplasia', 'advice-needed'],
      createdAt: '2024-01-12T11:45:00Z',
      updatedAt: '2024-01-12T11:45:00Z',
      likes: 19,
      replies: 16,
      views: 76,
      isPinned: false,
      isLocked: false,
      isSolved: false,
      lastActivity: '2024-01-15T08:20:00Z',
      lastReplyBy: {
        id: 'user_011',
        name: 'Kevin Murphy',
        joinDate: '2023-06-28',
        reputation: 112,
        badges: [
          { id: 'badge_008', name: 'Helpful Helper', icon: '🤝', description: 'Always ready to help others' },
        ],
      },
    },
  ];

  // Sample replies
  const sampleReplies: Reply[] = [
    {
      id: 'reply_001',
      postId: 'post_001',
      authorId: 'user_004',
      author: {
        id: 'user_004',
        name: 'Jessica Miller',
        joinDate: '2023-02-20',
        reputation: 89,
        badges: [],
      },
      content: 'House training typically takes 4-6 months for most puppies, but it can vary. The key is consistency! Take Max out every 2 hours, immediately after meals, and first thing in the morning. Always praise and treat when he goes outside. For accidents inside, clean thoroughly with an enzyme cleaner to remove odors. Never punish accidents - just redirect to the appropriate spot.',
      createdAt: '2024-01-15T14:22:00Z',
      updatedAt: '2024-01-15T14:22:00Z',
      likes: 8,
      isAnswer: false,
      images: [],
    },
    {
      id: 'reply_002',
      postId: 'post_001',
      authorId: 'user_012',
      author: {
        id: 'user_012',
        name: 'Steve Wilson',
        joinDate: '2023-07-15',
        reputation: 167,
        badges: [
          { id: 'badge_009', name: 'Dog Trainer', icon: '🐕', description: 'Professional dog trainer' },
        ],
      },
      content: 'Great advice from Jessica! I\'d also add that crate training can be incredibly helpful. Dogs naturally won\'t soil their sleeping area. Start with short periods and gradually increase. Also, watch for signs like sniffing, circling, or whining - these usually indicate he needs to go out.',
      createdAt: '2024-01-15T15:10:00Z',
      updatedAt: '2024-01-15T15:10:00Z',
      likes: 12,
      isAnswer: true,
      images: [],
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedPosts = await AsyncStorage.getItem('forumPosts');
      const storedReplies = await AsyncStorage.getItem('forumReplies');
      const storedCategories = await AsyncStorage.getItem('forumCategories');

      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      } else {
        setPosts(samplePosts);
        await AsyncStorage.setItem('forumPosts', JSON.stringify(samplePosts));
      }

      if (storedReplies) {
        setReplies(JSON.parse(storedReplies));
      } else {
        setReplies(sampleReplies);
        await AsyncStorage.setItem('forumReplies', JSON.stringify(sampleReplies));
      }

      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(sampleCategories);
        await AsyncStorage.setItem('forumCategories', JSON.stringify(sampleCategories));
      }
    } catch (error) {
      console.error('Error loading forum data:', error);
    }
  };

  const saveData = async (newPosts: ForumPost[], newReplies: Reply[]) => {
    try {
      await AsyncStorage.setItem('forumPosts', JSON.stringify(newPosts));
      await AsyncStorage.setItem('forumReplies', JSON.stringify(newReplies));
      setPosts(newPosts);
      setReplies(newReplies);
    } catch (error) {
      console.error('Error saving forum data:', error);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const createPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const post: ForumPost = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      author: currentUser,
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      replies: 0,
      views: 0,
      isPinned: false,
      isLocked: false,
      isSolved: false,
      lastActivity: new Date().toISOString(),
    };

    const updatedPosts = [post, ...posts];
    saveData(updatedPosts, replies);
    setNewPost({ title: '', content: '', category: '', tags: '' });
    setShowCreateModal(false);
  };

  const addReply = () => {
    if (!replyText.trim() || !selectedPost) {
      Alert.alert('Error', 'Please enter a reply');
      return;
    }

    const reply: Reply = {
      id: `reply_${Date.now()}`,
      postId: selectedPost.id,
      authorId: currentUser.id,
      author: currentUser,
      content: replyText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      isAnswer: false,
      images: [],
    };

    const updatedReplies = [...replies, reply];
    const updatedPosts = posts.map(post => 
      post.id === selectedPost.id 
        ? { 
            ...post, 
            replies: post.replies + 1,
            lastActivity: new Date().toISOString(),
            lastReplyBy: currentUser
          }
        : post
    );

    saveData(updatedPosts, updatedReplies);
    setReplyText('');
  };

  const likePost = (postId: string) => {
    const updatedPosts = posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    );
    saveData(updatedPosts, replies);
  };

  const likeReply = (replyId: string) => {
    const updatedReplies = replies.map(reply =>
      reply.id === replyId ? { ...reply, likes: reply.likes + 1 } : reply
    );
    saveData(posts, updatedReplies);
  };

  const getFilteredAndSortedPosts = () => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort posts
    switch (sortBy) {
      case 'latest':
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'popular':
        return filtered.sort((a, b) => b.likes - a.likes);
      case 'replies':
        return filtered.sort((a, b) => b.replies - a.replies);
      case 'views':
        return filtered.sort((a, b) => b.views - a.views);
      default:
        return filtered;
    }
  };

  const getPostReplies = (postId: string) => {
    return replies
      .filter(reply => reply.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderPostCard = ({ item }: { item: ForumPost }) => (
    <TouchableOpacity
      style={[styles.postCard, item.isPinned && styles.pinnedPost]}
      onPress={() => {
        const updatedPosts = posts.map(post =>
          post.id === item.id ? { ...post, views: post.views + 1 } : post
        );
        saveData(updatedPosts, replies);
        setSelectedPost(item);
        setShowPostModal(true);
      }}
    >
      {item.isPinned && (
        <View style={styles.pinnedBadge}>
          <Text style={styles.pinnedText}>📌 PINNED</Text>
        </View>
      )}

      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>{item.author.name[0]}</Text>
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <Text style={styles.postTime}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.postBadges}>
          {item.isSolved && (
            <View style={styles.solvedBadge}>
              <Text style={styles.solvedText}>✓ SOLVED</Text>
            </View>
          )}
          {item.isLocked && (
            <View style={styles.lockedBadge}>
              <Text style={styles.lockedText}>🔒</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>

      <View style={styles.postTags}>
        {item.tags.slice(0, 3).map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
        {item.tags.length > 3 && (
          <Text style={styles.moreTags}>+{item.tags.length - 3} more</Text>
        )}
      </View>

      <View style={styles.postStats}>
        <TouchableOpacity style={styles.statItem} onPress={() => likePost(item.id)}>
          <Text style={styles.statIcon}>👍</Text>
          <Text style={styles.statText}>{item.likes}</Text>
        </TouchableOpacity>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>💬</Text>
          <Text style={styles.statText}>{item.replies}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>👁️</Text>
          <Text style={styles.statText}>{item.views}</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {categories.find(cat => cat.id === item.category)?.icon} {item.category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderReplyCard = ({ item }: { item: Reply }) => (
    <View style={[styles.replyCard, item.isAnswer && styles.answerCard]}>
      {item.isAnswer && (
        <View style={styles.answerBadge}>
          <Text style={styles.answerText}>✓ ANSWER</Text>
        </View>
      )}
      
      <View style={styles.replyHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>{item.author.name[0]}</Text>
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <Text style={styles.replyTime}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.likeButton} onPress={() => likeReply(item.id)}>
          <Text style={styles.likeIcon}>👍</Text>
          <Text style={styles.likeCount}>{item.likes}</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.replyContent}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Forum</Text>
        <Text style={styles.headerSubtitle}>{posts.length} discussions</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search discussions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'all' && styles.activeCategoryButton]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.categoryButtonText, selectedCategory === 'all' && styles.activeCategoryText]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.activeCategoryButton,
              { borderColor: category.color }
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[styles.categoryButtonText, selectedCategory === category.id && styles.activeCategoryText]}>
              {category.icon} {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort:</Text>
        {[
          { key: 'latest', label: 'Latest' },
          { key: 'popular', label: 'Popular' },
          { key: 'replies', label: 'Most Replies' },
          { key: 'views', label: 'Most Views' },
        ].map(sort => (
          <TouchableOpacity
            key={sort.key}
            style={[styles.sortButton, sortBy === sort.key && styles.activeSortButton]}
            onPress={() => setSortBy(sort.key as any)}
          >
            <Text style={[styles.sortText, sortBy === sort.key && styles.activeSortText]}>
              {sort.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Posts List */}
      <FlatList
        data={getFilteredAndSortedPosts()}
        renderItem={renderPostCard}
        keyExtractor={item => item.id}
        style={styles.postsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No discussions found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />

      {/* Create Post Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.createButtonText}>+</Text>
      </TouchableOpacity>

      {/* Post Details Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedPost && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selectedPost.title}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPostModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Original Post */}
              <View style={styles.originalPost}>
                <View style={styles.postHeader}>
                  <View style={styles.authorInfo}>
                    <View style={styles.authorAvatar}>
                      <Text style={styles.authorAvatarText}>{selectedPost.author.name[0]}</Text>
                    </View>
                    <View style={styles.authorDetails}>
                      <Text style={styles.authorName}>{selectedPost.author.name}</Text>
                      <Text style={styles.postTime}>{formatTimeAgo(selectedPost.createdAt)}</Text>
                    </View>
                  </View>
                </View>
                
                <Text style={styles.originalPostContent}>{selectedPost.content}</Text>
                
                <View style={styles.postTags}>
                  {selectedPost.tags.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.postStats}>
                  <TouchableOpacity style={styles.statItem} onPress={() => likePost(selectedPost.id)}>
                    <Text style={styles.statIcon}>👍</Text>
                    <Text style={styles.statText}>{selectedPost.likes}</Text>
                  </TouchableOpacity>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>💬</Text>
                    <Text style={styles.statText}>{selectedPost.replies}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>👁️</Text>
                    <Text style={styles.statText}>{selectedPost.views}</Text>
                  </View>
                </View>
              </View>

              {/* Replies */}
              <View style={styles.repliesSection}>
                <Text style={styles.repliesSectionTitle}>
                  Replies ({getPostReplies(selectedPost.id).length})
                </Text>
                <FlatList
                  data={getPostReplies(selectedPost.id)}
                  renderItem={renderReplyCard}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                />
              </View>
            </ScrollView>

            {/* Reply Input */}
            <View style={styles.replyInputContainer}>
              <TextInput
                style={styles.replyInput}
                placeholder="Write a reply..."
                value={replyText}
                onChangeText={setReplyText}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={styles.replyButton} onPress={addReply}>
                <Text style={styles.replyButtonText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* Create Post Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Discussion</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.createFormContainer}>
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              value={newPost.title}
              onChangeText={(text) => setNewPost({...newPost, title: text})}
              placeholder="Enter discussion title..."
            />

            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categorySelectButton,
                    newPost.category === category.id && styles.selectedCategoryButton
                  ]}
                  onPress={() => setNewPost({...newPost, category: category.id})}
                >
                  <Text style={styles.categorySelectText}>
                    {category.icon} {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Content</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={newPost.content}
              onChangeText={(text) => setNewPost({...newPost, content: text})}
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              multiline
              numberOfLines={6}
            />

            <Text style={styles.fieldLabel}>Tags (comma-separated)</Text>
            <TextInput
              style={styles.textInput}
              value={newPost.tags}
              onChangeText={(text) => setNewPost({...newPost, tags: text})}
              placeholder="e.g. training, puppy, advice"
            />
          </ScrollView>

          <View style={styles.createFormActions}>
            <TouchableOpacity style={styles.createPostButton} onPress={createPost}>
              <Text style={styles.createPostButtonText}>Create Discussion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 4,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  activeCategoryButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sortLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginRight: 16,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  activeSortButton: {
    backgroundColor: '#007bff',
  },
  sortText: {
    fontSize: 12,
    color: '#6c757d',
  },
  activeSortText: {
    color: '#fff',
  },
  postsList: {
    flex: 1,
    padding: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pinnedPost: {
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  pinnedBadge: {
    marginBottom: 8,
  },
  pinnedText: {
    fontSize: 10,
    color: '#ffc107',
    fontWeight: 'bold',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  postTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  postBadges: {
    flexDirection: 'row',
  },
  solvedBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 4,
  },
  solvedText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  lockedBadge: {
    paddingHorizontal: 4,
    marginLeft: 4,
  },
  lockedText: {
    fontSize: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 12,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#6c757d',
  },
  moreTags: {
    fontSize: 10,
    color: '#6c757d',
    alignSelf: 'center',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6c757d',
  },
  categoryBadge: {
    marginLeft: 'auto',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    color: '#6c757d',
    textTransform: 'capitalize',
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  createButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 16,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#6c757d',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  originalPost: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  originalPostContent: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    marginBottom: 16,
  },
  repliesSection: {
    flex: 1,
  },
  repliesSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  replyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  answerCard: {
    backgroundColor: '#e8f5e8',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  answerBadge: {
    marginBottom: 8,
  },
  answerText: {
    fontSize: 10,
    color: '#28a745',
    fontWeight: 'bold',
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyTime: {
    fontSize: 10,
    color: '#6c757d',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  likeCount: {
    fontSize: 12,
    color: '#6c757d',
  },
  replyContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  replyInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'flex-end',
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
    fontSize: 14,
    maxHeight: 80,
    backgroundColor: '#f8f9fa',
  },
  replyButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  replyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  createFormContainer: {
    flex: 1,
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categorySelectButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  categorySelectText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
  },
  createFormActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  createPostButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createPostButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CommunityForumScreen;
