import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { Todo } from '../types';

export const TodoCard = () => {
    const { todos, addTodo, toggleTodo, deleteTodo, showToast } = useAppStore();
    const [newTodoText, setNewTodoText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const handleAddTodo = () => {
        if (!newTodoText.trim()) {
            showToast("Cannot add empty task", "error");
            return;
        }
        addTodo(newTodoText.trim());
        setNewTodoText('');
        showToast("Task added", "success");
    };

    const renderItem = ({ item }: { item: Todo }) => (
        <View style={styles.todoItem}>
            <TouchableOpacity onPress={() => toggleTodo(item.id)} style={styles.checkboxContainer}>
                <Ionicons
                    name={item.completed ? "checkbox" : "square-outline"}
                    size={20}
                    color={item.completed ? theme.colors.success : theme.colors.textDim}
                />
            </TouchableOpacity>

            <Text
                style={[
                    styles.todoText,
                    item.completed && styles.todoTextCompleted
                ]}
                numberOfLines={1}
            >
                {item.text}
            </Text>

            <TouchableOpacity onPress={() => deleteTodo(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
            </TouchableOpacity>
        </View>
    );

    const latestTodo = todos.find(t => !t.completed) || todos[0];

    return (
        <>
            <LinearGradient
                colors={[theme.colors.surface, theme.colors.surfaceHighlight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTitle}>
                        <Ionicons name="list-outline" size={14} color={theme.colors.secondary} />
                        <Text style={styles.headerText}>TASKS</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.viewAllBtn}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.viewAllText}>{todos.length} Total</Text>
                        <Ionicons name="open-outline" size={12} color={theme.colors.textDim} />
                    </TouchableOpacity>
                </View>

                {/* Single Item Preview */}
                <View style={styles.previewContainer}>
                    {latestTodo ? (
                        <View>
                            <Text style={styles.latestLabel}>
                                {latestTodo.completed ? 'Latest:' : 'Up Next:'}
                            </Text>
                            {renderItem({ item: latestTodo })}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No tasks pending</Text>
                        </View>
                    )}
                </View>

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Quick Add..."
                        placeholderTextColor={theme.colors.textDim}
                        value={newTodoText}
                        onChangeText={setNewTodoText}
                        onSubmitEditing={handleAddTodo}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={handleAddTodo}>
                        <Ionicons name="add" size={20} color="#000" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Full List Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <LinearGradient
                                colors={[theme.colors.surface, '#1a1f3c']}
                                style={styles.modalContent}
                            >
                                <View style={styles.modalHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Ionicons name="list" size={24} color={theme.colors.primary} />
                                        <Text style={styles.modalTitle}>All Tasks</Text>
                                        <View style={styles.countBadge}>
                                            <Text style={styles.countText}>{todos.filter(t => !t.completed).length}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={theme.colors.textDim} />
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={todos}
                                    renderItem={renderItem}
                                    keyExtractor={item => item.id}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.listContent}
                                    ListEmptyComponent={
                                        <View style={[styles.emptyState, { minHeight: 100 }]}>
                                            <Ionicons name="checkmark-circle-outline" size={48} color={theme.colors.surfaceHighlight} />
                                            <Text style={styles.emptyText}>All caught up!</Text>
                                        </View>
                                    }
                                />
                            </LinearGradient>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        ...theme.shadows.default,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flex: 1,
        minHeight: 150, // Reduced from 250
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    headerText: {
        color: theme.colors.text,
        fontWeight: '700',
        fontSize: 10,
        letterSpacing: 1,
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 4,
    },
    viewAllText: {
        color: theme.colors.textDim,
        fontSize: 10,
        fontWeight: '600',
    },
    previewContainer: {
        flex: 1,
        justifyContent: 'center',
        marginBottom: 8,
    },
    latestLabel: {
        color: theme.colors.textDim,
        fontSize: 9,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.textDim,
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 8,
    },
    todoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 8,
        padding: 8,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    checkboxContainer: {
        marginRight: 8,
    },
    todoText: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 14,
    },
    todoTextCompleted: {
        color: theme.colors.textDim,
        textDecorationLine: 'line-through',
    },
    deleteBtn: {
        padding: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        color: theme.colors.text,
        fontSize: 14,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    addBtn: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.default,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    countBadge: {
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    countText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    listContent: {
        paddingBottom: 20,
    },
});
