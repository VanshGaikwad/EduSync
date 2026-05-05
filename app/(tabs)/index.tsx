import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/context/auth-context';

type StatusType = 'Available' | 'Busy' | 'Leave';

const STATUS_COLORS: Record<StatusType, string> = {
  Available: '#15803d',
  Busy: '#b91c1c',
  Leave: '#ca8a04',
};

export default function HomeScreen() {
  const { profile, facultyStatuses, updateMyStatus, updateMyMessageOnly, deleteFacultyByAdmin } = useAuth();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null);
  const [message, setMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingFacultyId, setDeletingFacultyId] = useState<string | null>(null);

  const myStatus = useMemo(
    () => facultyStatuses.find((item) => item.facultyId === profile?.uid),
    [facultyStatuses, profile?.uid]
  );

  const isFacultyUser = profile?.role === 'faculty';
  const isSuperAdmin = profile?.role === 'super_admin';
  const totalFaculty = facultyStatuses.length;

  const filteredFacultyStatuses = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return facultyStatuses;
    }

    return facultyStatuses.filter((item) => {
      const name = item.name.toLowerCase();
      const department = (item.department ?? '').toLowerCase();
      const cabinNumber = (item.cabinNumber ?? '').toLowerCase();

      return name.includes(query) || department.includes(query) || cabinNumber.includes(query);
    });
  }, [facultyStatuses, searchText]);

  const handleStatusClick = async (status: StatusType) => {
    if (!isFacultyUser) {
      Alert.alert('Not allowed', 'Only faculty can update status.');
      return;
    }

    // Toggle: if same button clicked, turn off; otherwise, select new status
    const newStatus = selectedStatus === status ? null : status;
    
    try {
      setSaving(true);
      
      if (newStatus) {
        // If turning ON a status
        setSelectedStatus(newStatus);
        await updateMyStatus(newStatus, message.trim());
        Alert.alert('Updated', `Status changed to ${newStatus}`);
      } else {
        // If turning OFF (same button clicked again)
        setSelectedStatus(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to update status.';
      Alert.alert('Update failed', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!isFacultyUser) {
      Alert.alert('Not allowed', 'Only faculty can send message.');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Empty message', 'Please enter a message to send.');
      return;
    }

    try {
      setSaving(true);
      await updateMyMessageOnly(message.trim());
      Alert.alert('Sent', 'Your message has been sent to students and hardware.');
      setMessage('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to send message.';
      Alert.alert('Send failed', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaculty = (facultyId: string, facultyName: string) => {
    Alert.alert(
      'Delete faculty',
      `Are you sure you want to delete ${facultyName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void executeDeleteFaculty(facultyId);
          },
        },
      ]
    );
  };

  const executeDeleteFaculty = async (facultyId: string) => {
    try {
      setDeletingFacultyId(facultyId);
      await deleteFacultyByAdmin(facultyId);
      Alert.alert('Faculty deleted', 'Faculty account removed successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete faculty account.';
      Alert.alert('Delete failed', message);
    } finally {
      setDeletingFacultyId(null);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.pageTitle}>Faculty Status</Text>
          <Text style={styles.pageSubtitle}>
            {profile?.role === 'student'
              ? 'Student view: you can see live faculty status only.'
              : profile?.role === 'super_admin'
                ? 'Admin view: monitor faculty status and management summary.'
                : 'Faculty view: update your live status for students.'}
          </Text>
          {profile?.role === 'super_admin' ? (
            <View style={styles.adminSummaryBox}>
              <Text style={styles.adminSummaryLabel}>Total Faculties Created</Text>
              <Text style={styles.adminSummaryValue}>{totalFaculty}</Text>
            </View>
          ) : null}
        </View>

        {isFacultyUser ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update My Status</Text>

            <View style={styles.buttonRow}>
              {(['Available', 'Busy', 'Leave'] as StatusType[]).map((status) => {
                const active = selectedStatus === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      active && {
                        backgroundColor: STATUS_COLORS[status],
                      },
                      !active && {
                        backgroundColor: '#f0f4f8',
                        borderColor: '#cbd5e1',
                      },
                      saving && styles.disabledButton,
                    ]}
                    onPress={() => handleStatusClick(status)}
                    disabled={saving}>
                    {saving ? (
                      <ActivityIndicator size="small" color={active ? '#ffffff' : STATUS_COLORS[status]} />
                    ) : (
                      <Text style={[styles.statusText, active && styles.statusTextActive, !active && { color: STATUS_COLORS[status] }]}>
                        {status}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Custom Message (optional)</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="In class, meeting, office hours..."
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />

            <View style={styles.messageButtonContainer}>
              <TouchableOpacity 
                style={styles.messageButton} 
                onPress={handleSendMessage} 
                activeOpacity={0.85}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#1d4ed8" /> : <Text style={styles.messageButtonText}>Custom Msg</Text>}
              </TouchableOpacity>
            </View>

            {myStatus ? (
              <View style={styles.currentStatusCard}>
                <Text style={styles.currentStatusLabel}>Current Status</Text>
                <Text style={styles.currentStatusValue}>{myStatus.status}</Text>
                <Text style={styles.currentStatusMessage}>{myStatus.message || 'No message'}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Faculty Directory Status</Text>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by faculty name / department / cabin"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />

          {facultyStatuses.length === 0 ? (
            <Text style={styles.emptyText}>No faculty status available yet.</Text>
          ) : filteredFacultyStatuses.length === 0 ? (
            <Text style={styles.emptyText}>No faculty found for this search.</Text>
          ) : (
            filteredFacultyStatuses.map((item) =>
              isSuperAdmin ? (
                <View key={item.facultyId} style={styles.statusCard}>
                  <View style={styles.statusCardHeader}>
                    <Text style={styles.facultyName}>{item.name}</Text>
                    <View style={[styles.badge, { backgroundColor: `${STATUS_COLORS[item.status]}22` }]}>
                      <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.metaText}>
                    {item.department || 'Department not set'} | Cabin {item.cabinNumber || '-'}
                  </Text>
                  <Text style={styles.messageText}>{item.message || 'No message'}</Text>

                  <View style={styles.adminActionRow}>
                    <TouchableOpacity
                      style={styles.viewButton}
                      activeOpacity={0.85}
                      onPress={() =>
                        router.push({
                          pathname: '/faculty/[facultyId]',
                          params: { facultyId: item.facultyId },
                        })
                      }>
                      <Text style={styles.viewButtonText}>View Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      activeOpacity={0.85}
                      onPress={() => handleDeleteFaculty(item.facultyId, item.name)}
                      disabled={deletingFacultyId === item.facultyId}>
                      {deletingFacultyId === item.facultyId ? (
                        <ActivityIndicator color="#b91c1c" />
                      ) : (
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  key={item.facultyId}
                  style={styles.statusCard}
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({
                      pathname: '/faculty/[facultyId]',
                      params: { facultyId: item.facultyId },
                    })
                  }>
                  <View style={styles.statusCardHeader}>
                    <Text style={styles.facultyName}>{item.name}</Text>
                    <View style={[styles.badge, { backgroundColor: `${STATUS_COLORS[item.status]}22` }]}>
                      <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.metaText}>
                    {item.department || 'Department not set'} | Cabin {item.cabinNumber || '-'}
                  </Text>
                  <Text style={styles.messageText}>{item.message || 'No message'}</Text>
                  <Text style={styles.viewProfileText}>Tap to view full profile</Text>
                </TouchableOpacity>
              )
            )
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fbff',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  pageSubtitle: {
    marginTop: 6,
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  adminSummaryBox: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#eff6ff',
  },
  adminSummaryLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  adminSummaryValue: {
    marginTop: 4,
    color: '#1e3a8a',
    fontSize: 22,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 16,
  },
  sectionTitle: {
    color: '#1d4ed8',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderColor: '#cbd5e1',
  },
  statusText: {
    fontWeight: '700',
    fontSize: 14,
  },
  statusTextActive: {
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  label: {
    marginTop: 14,
    marginBottom: 8,
    color: '#334155',
    fontWeight: '600',
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fbff',
  },
  messageButtonContainer: {
    marginTop: 14,
  },
  messageButton: {
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1d4ed8',
  },
  messageButtonText: {
    color: '#1d4ed8',
    fontWeight: '700',
    fontSize: 14,
  },
  currentStatusCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f8fbff',
  },
  currentStatusLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  currentStatusValue: {
    marginTop: 4,
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  currentStatusMessage: {
    marginTop: 4,
    color: '#475569',
    fontSize: 13,
  },
  emptyText: {
    color: '#64748b',
  },
  statusCard: {
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f8fbff',
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  facultyName: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 15,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 12,
  },
  metaText: {
    marginTop: 6,
    color: '#64748b',
    fontSize: 12,
  },
  messageText: {
    marginTop: 4,
    color: '#334155',
    fontSize: 13,
  },
  viewProfileText: {
    marginTop: 8,
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '600',
  },
  adminActionRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1d4ed8',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: '#eff6ff',
  },
  viewButtonText: {
    color: '#1d4ed8',
    fontWeight: '700',
    fontSize: 13,
  },
  deleteButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#b91c1c',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#b91c1c',
    fontWeight: '700',
    fontSize: 13,
  },
});
