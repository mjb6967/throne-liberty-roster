import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, RefreshCw, AlertCircle, List, Grid, Calendar, TrendingUp, Download, Save, Loader, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';
import { Package } from 'lucide-react';

const ThroneLibertyRoster = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('Weapon');
  const [draggedMember, setDraggedMember] = useState(null);

  const itemTypes = ['Weapon', 'Armor', 'Accessory', 'Material', 'Other'];
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([[], [], [], []]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('DPS');
  const [activeTab, setActiveTab] = useState('groups');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newEventType, setNewEventType] = useState('Archboss');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [eventFilter, setEventFilter] = useState('all');

  const eventTypes = ['Archboss', 'PVP Event', 'Siege', 'Guild War', 'Dungeon', 'Raid', 'Other'];
  
  const weaponCombos = [
    'Crossbow + Dagger', 'Crossbow + Greatsword', 'Crossbow + Sword & Shield', 'Crossbow + Longbow',
    'Crossbow + Staff', 'Crossbow + Wand & Tome', 'Greatsword + Wand & Tome', 'Greatsword + Dagger',
    'Greatsword + Sword & Shield', 'Greatsword + Longbow', 'Greatsword + Staff', 'Sword & Shield + Dagger',
    'Sword & Shield + Longbow', 'Sword & Shield + Staff', 'Sword & Shield + Wand & Tome', 'Longbow + Dagger',
    'Longbow + Staff', 'Longbow + Wand & Tome', 'Staff + Dagger', 'Staff + Wand & Tome',
    'Wand & Tome + Dagger', 'Spear + Crossbow', 'Spear + Dagger', 'Spear + Greatsword',
    'Spear + Longbow', 'Spear + Staff', 'Spear + Sword & Shield', 'Spear + Wand & Tome',
    'Orb + Crossbow', 'Orb + Dagger', 'Orb + Greatsword', 'Orb + Longbow',
    'Orb + Staff', 'Orb + Spear', 'Orb + Sword & Shield', 'Orb + Wand & Tome'
  ];

  const weaponToClass = {
    'Crossbow + Dagger': 'Scorpion', 'Crossbow + Greatsword': 'Outrider', 'Crossbow + Sword & Shield': 'Raider',
    'Crossbow + Longbow': 'Scout', 'Crossbow + Staff': 'Battleweaver', 'Crossbow + Wand & Tome': 'Fury',
    'Greatsword + Wand & Tome': 'Paladin', 'Greatsword + Dagger': 'Ravager', 'Greatsword + Sword & Shield': 'Crusader',
    'Greatsword + Longbow': 'Ranger', 'Greatsword + Staff': 'Sentinel', 'Sword & Shield + Dagger': 'Berserker',
    'Sword & Shield + Longbow': 'Warden', 'Sword & Shield + Staff': 'Disciple', 'Sword & Shield + Wand & Tome': 'Templar',
    'Longbow + Dagger': 'Infiltrator', 'Longbow + Staff': 'Liberator', 'Longbow + Wand & Tome': 'Seeker',
    'Staff + Dagger': 'Spellblade', 'Staff + Wand & Tome': 'Invocator', 'Wand & Tome + Dagger': 'Darkblighter',
    'Spear + Crossbow': 'Cavalier', 'Spear + Dagger': 'Shadowdancer', 'Spear + Greatsword': 'Gladiator',
    'Spear + Longbow': 'Impaler', 'Spear + Staff': 'Eradicator', 'Spear + Sword & Shield': 'Steelheart',
    'Spear + Wand & Tome': 'Voidlance', 'Orb + Crossbow': 'Crucifix', 'Orb + Dagger': 'Lunarch',
    'Orb + Greatsword': 'Justicar', 'Orb + Longbow': 'Scryer', 'Orb + Staff': 'Enigma',
    'Orb + Spear': 'Polaris', 'Orb + Sword & Shield': 'Guardian', 'Orb + Wand & Tome': 'Oracle'
  };

  const classNames = [
    'Scorpion', 'Outrider', 'Raider', 'Scout', 'Battleweaver', 'Fury',
    'Paladin', 'Ravager', 'Crusader', 'Ranger', 'Sentinel', 'Berserker',
    'Warden', 'Disciple', 'Templar', 'Infiltrator', 'Liberator', 'Seeker',
    'Spellblade', 'Invocator', 'Darkblighter', 'Cavalier', 'Shadowdancer',
    'Gladiator', 'Impaler', 'Eradicator', 'Steelheart', 'Voidlance',
    'Crucifix', 'Lunarch', 'Justicar', 'Scryer', 'Enigma', 'Polaris',
    'Guardian', 'Oracle'
  ];

  // Load groups from database
  const loadGroupsFromDB = async (membersList) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('group_index')
        .order('position');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const maxGroupIndex = Math.max(...data.map(g => g.group_index), -1);
        const groupsArray = Array(maxGroupIndex + 1).fill(null).map(() => []);
        
        data.forEach(groupMember => {
          const member = membersList.find(m => m.id === groupMember.member_id);
          if (member) {
            const memberObj = {
              id: member.id,
              name: member.name,
              role: member.role,
              onDiscord: member.on_discord,
              onProbation: member.on_probation,
              questlog: member.questlog || '',
              weaponCombo: member.weapon_combo || '',
              className: member.class_name || ''
            };
            groupsArray[groupMember.group_index].push(memberObj);
          }
        });
        
        setGroups(groupsArray);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  // Load all data from Supabase
  const loadData = async () => {
    setLoading(true);
    await loadItems();
    try {
      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('name');
      
      if (membersError) throw membersError;
      
      if (membersData) {
        const loadedMembers = membersData.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role,
          onDiscord: m.on_discord,
          onProbation: m.on_probation,
          questlog: m.questlog || '',
          weaponCombo: m.weapon_combo || '',
          className: m.class_name || ''
        }));
        setMembers(loadedMembers);
        
        // Load groups after members are loaded
        await loadGroupsFromDB(membersData);
      }

      // Load events with attendees
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          event_attendees(member_id)
        `)
        .order('date', { ascending: false });
      
      if (eventsError) throw eventsError;
      
      if (eventsData) {
        setEvents(eventsData.map(e => ({
          id: e.id,
          type: e.type,
          date: e.date,
          attendees: e.event_attendees.map(a => a.member_id),
          attendeeCount: e.attendee_count
        })));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
  try {
    const { data: itemsData, error: itemsError } = await supabase
      .from('items')
      .select(`
        *,
        item_seekers(member_id, received)
      `)
      .order('created_at', { ascending: false });
    
    if (itemsError) throw itemsError;
    
    if (itemsData) {
      setItems(itemsData.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        seekers: item.item_seekers.map(s => ({
          memberId: s.member_id,
          received: s.received
        }))
      })));
    }
  } catch (error) {
    console.error('Error loading items:', error);
  }
};


// Add item
const addItem = async () => {
  if (newItemName.trim()) {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert({
          name: newItemName.trim(),
          type: newItemType
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newItem = {
        id: data.id,
        name: data.name,
        type: data.type,
        seekers: []
      };
      
      setItems([newItem, ...items]);
      setNewItemName('');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item. Please try again.');
    }
  }
};

// Delete item
const deleteItem = async (itemId) => {
  try {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);
    
    if (error) throw error;
    
    setItems(items.filter(i => i.id !== itemId));
  } catch (error) {
    console.error('Error deleting item:', error);
    alert('Error deleting item. Please try again.');
  }
};

// Add seeker to item
const addSeekerToItem = async (itemId, memberId) => {
  const item = items.find(i => i.id === itemId);
  if (!item || item.seekers.some(s => s.memberId === memberId)) return;
  
  try {
    const { error } = await supabase
      .from('item_seekers')
      .insert({
        item_id: itemId,
        member_id: memberId,
        received: false
      });
    
    if (error) throw error;
    
    setItems(items.map(i => 
      i.id === itemId 
        ? { ...i, seekers: [...i.seekers, { memberId, received: false }] }
        : i
    ));
  } catch (error) {
    console.error('Error adding seeker:', error);
    alert('Error adding seeker. Please try again.');
  }
};

// Remove seeker from item
const removeSeekerFromItem = async (itemId, memberId) => {
  try {
    const { error } = await supabase
      .from('item_seekers')
      .delete()
      .eq('item_id', itemId)
      .eq('member_id', memberId);
    
    if (error) throw error;
    
    setItems(items.map(i => 
      i.id === itemId 
        ? { ...i, seekers: i.seekers.filter(s => s.memberId !== memberId) }
        : i
    ));
  } catch (error) {
    console.error('Error removing seeker:', error);
    alert('Error removing seeker. Please try again.');
  }
};

// Toggle received status
const toggleReceivedStatus = async (itemId, memberId) => {
  const item = items.find(i => i.id === itemId);
  const seeker = item?.seekers.find(s => s.memberId === memberId);
  if (!seeker) return;
  
  try {
    const { error } = await supabase
      .from('item_seekers')
      .update({ received: !seeker.received })
      .eq('item_id', itemId)
      .eq('member_id', memberId);
    
    if (error) throw error;
    
    setItems(items.map(i => 
      i.id === itemId 
        ? {
            ...i,
            seekers: i.seekers.map(s => 
              s.memberId === memberId 
                ? { ...s, received: !s.received }
                : s
            )
          }
        : i
    ));
  } catch (error) {
    console.error('Error updating received status:', error);
    alert('Error updating status. Please try again.');
  }
};

// Drag and drop handlers
const handleDragStart = (member) => {
  setDraggedMember(member);
};

const handleDragOver = (e) => {
  e.preventDefault();
};

const handleDrop = async (e, itemId) => {
  e.preventDefault();
  if (draggedMember) {
    await addSeekerToItem(itemId, draggedMember.id);
    setDraggedMember(null);
  }
};
  
const handleLogin = () => {
    if (password === 'AbsoLOOT') {
      setIsAuthenticated(true);
      localStorage.setItem('rosterAuthenticated', 'true');
      loadData();
    } else {
      alert('Wrong password!');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('rosterAuthenticated');
    setPassword('');
  };
  
  // Save groups to database
  const saveGroups = async (newGroups) => {
    setSaving(true);
    try {
      // Delete existing groups
      await supabase.from('groups').delete().neq('id', 0);
      
      // Insert new groups
      const groupRecords = [];
      newGroups.forEach((group, groupIndex) => {
        group.forEach((member, position) => {
          groupRecords.push({
            group_index: groupIndex,
            member_id: member.id,
            position: position
          });
        });
      });
      
      if (groupRecords.length > 0) {
        const { error } = await supabase.from('groups').insert(groupRecords);
        if (error) throw error;
      }
      
      setGroups(newGroups);
    } catch (error) {
      console.error('Error saving groups:', error);
      alert('Error saving groups. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveMember = async (member) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('members')
        .upsert({
          id: member.id,
          name: member.name,
          role: member.role,
          on_discord: member.onDiscord,
          on_probation: member.onProbation,
          questlog: member.questlog,
          weapon_combo: member.weaponCombo,
          class_name: member.className
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Error saving member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addGroup = async () => {
    await saveGroups([...groups, []]);
  };

  const removeGroup = async (groupIndex) => {
    if (groups.length <= 1) return;
    const newGroups = groups.filter((_, index) => index !== groupIndex);
    await saveGroups(newGroups);
  };

  const addMember = async () => {
    if (newMemberName.trim()) {
      try {
        const { data, error } = await supabase
          .from('members')
          .insert({
            name: newMemberName.trim(),
            role: newMemberRole,
            on_discord: false,
            on_probation: false,
            questlog: '',
            weapon_combo: '',
            class_name: ''
          })
          .select()
          .single();
        
        if (error) throw error;
        
        const newMember = {
          id: data.id,
          name: data.name,
          role: data.role,
          onDiscord: data.on_discord,
          onProbation: data.on_probation,
          questlog: data.questlog || '',
          weaponCombo: data.weapon_combo || '',
          className: data.class_name || ''
        };
        
        setMembers([...members, newMember]);
        setNewMemberName('');
      } catch (error) {
        console.error('Error adding member:', error);
        alert('Error adding member. Please try again.');
      }
    }
  };

  const removeMember = async (id) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setMembers(members.filter(m => m.id !== id));
      setGroups(groups.map(g => g.filter(m => m.id !== id)));
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Error removing member. Please try again.');
    }
  };

  const toggleDiscord = async (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    const updatedMember = { ...member, onDiscord: !member.onDiscord };
    setMembers(members.map(m => m.id === id ? updatedMember : m));
    await saveMember(updatedMember);
  };

  const toggleProbation = async (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    const updatedMember = { ...member, onProbation: !member.onProbation };
    setMembers(members.map(m => m.id === id ? updatedMember : m));
    setGroups(groups.map(g => g.filter(m => m.id !== id)));
    await saveMember(updatedMember);
  };

  const updateQuestlog = async (id, questlog) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    const updatedMember = { ...member, questlog };
    setMembers(members.map(m => m.id === id ? updatedMember : m));
    await saveMember(updatedMember);
  };

  const updateMemberRole = async (id, role) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    const updatedMember = { ...member, role };
    setMembers(members.map(m => m.id === id ? updatedMember : m));
    await saveMember(updatedMember);
  };

  const updateWeaponCombo = async (id, weaponCombo) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    const className = weaponToClass[weaponCombo] || '';
    const updatedMember = { ...member, weaponCombo, className };
    setMembers(members.map(m => m.id === id ? updatedMember : m));
    await saveMember(updatedMember);
  };

  const updateClassName = async (id, className) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    const updatedMember = { ...member, className };
    setMembers(members.map(m => m.id === id ? updatedMember : m));
    await saveMember(updatedMember);
  };

 const assignToGroup = async (member, groupIndex) => {
  if (groups[groupIndex].length >= 6 || member.onProbation) return;
  
  // Ensure the member object has all required properties
  const fullMember = members.find(m => m.id === member.id);
  if (!fullMember) return;
  
  const newGroups = groups.map((g, i) => {
    if (i === groupIndex) {
      // Add member to this group
      return [...g, fullMember];
    } else {
      // Remove member from other groups
      return g.filter(m => m.id !== fullMember.id);
    }
  });
  
  await saveGroups(newGroups);
};

  const removeFromGroup = async (memberId, groupIndex) => {
    const newGroups = [...groups];
    newGroups[groupIndex] = newGroups[groupIndex].filter(m => m.id !== memberId);
    await saveGroups(newGroups);
  };

  const autoAssign = async () => {
    const activeMembers = members.filter(m => !m.onProbation);
    const unassigned = activeMembers.filter(m => 
      !groups.some(g => g.some(gm => gm.id === m.id))
    );
    
    const tanks = unassigned.filter(m => m.role === 'TANK');
    const healers = unassigned.filter(m => m.role === 'HEALER');
    const dps = unassigned.filter(m => m.role === 'DPS');
    const unknown = unassigned.filter(m => m.role === 'UNKNOWN');
    
    const numGroups = groups.length;
    const newGroups = Array(numGroups).fill(null).map(() => []);
    
    for (let i = 0; i < numGroups; i++) {
      if (tanks[i]) newGroups[i].push(tanks[i]);
      if (healers[i]) newGroups[i].push(healers[i]);
    }
    
    let groupIndex = 0;
    [...dps, ...unknown].forEach(member => {
      while (newGroups[groupIndex].length >= 6 && groupIndex < numGroups - 1) {
        groupIndex++;
      }
      if (groupIndex < numGroups && newGroups[groupIndex].length < 6) {
        newGroups[groupIndex].push(member);
      }
    });
    
    await saveGroups(newGroups);
  };

  const clearGroups = async () => {
    await saveGroups([[], [], [], []]);
  };

  const addEvent = async () => {
    if (selectedAttendees.length === 0) return;
    
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          type: newEventType,
          date: newEventDate,
          attendee_count: selectedAttendees.length
        })
        .select()
        .single();
      
      if (eventError) throw eventError;
      
      const attendeeRecords = selectedAttendees.map(memberId => ({
        event_id: eventData.id,
        member_id: memberId
      }));
      
      const { error: attendeesError } = await supabase
        .from('event_attendees')
        .insert(attendeeRecords);
      
      if (attendeesError) throw attendeesError;
      
      const newEvent = {
        id: eventData.id,
        type: eventData.type,
        date: eventData.date,
        attendees: selectedAttendees,
        attendeeCount: selectedAttendees.length
      };
      
      setEvents([newEvent, ...events]);
      setSelectedAttendees([]);
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Error adding event. Please try again.');
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      setEvents(events.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  const toggleAttendee = (memberId) => {
    if (selectedAttendees.includes(memberId)) {
      setSelectedAttendees(selectedAttendees.filter(id => id !== memberId));
    } else {
      setSelectedAttendees([...selectedAttendees, memberId]);
    }
  };

  const getMemberStats = (memberId) => {
    const memberEvents = events.filter(e => e.attendees.includes(memberId));
    const archboss = memberEvents.filter(e => e.type === 'Archboss').length;
    const pvp = memberEvents.filter(e => e.type === 'PVP Event').length;
    const siege = memberEvents.filter(e => e.type === 'Siege').length;
    const total = memberEvents.length;
    
    return { archboss, pvp, siege, total };
  };

  const getEventTypeStats = () => {
    const stats = {};
    eventTypes.forEach(type => {
      stats[type] = events.filter(e => e.type === type).length;
    });
    return stats;
  };

  const getTopParticipants = (limit = 5) => {
    const activeMembers = members.filter(m => !m.onProbation);
    return activeMembers
      .map(m => ({ ...m, eventCount: getMemberStats(m.id).total }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, limit);
  };

  const exportEventData = () => {
    const csvContent = [
      ['Event Type', 'Date', 'Attendees', 'Count'].join(','),
      ...events.map(e => [
        e.type,
        e.date,
        e.attendees.map(id => members.find(m => m.id === id)?.name).join('; '),
        e.attendeeCount
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event-attendance.csv';
    a.click();
  };
  
 // Check if already authenticated on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('rosterAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadData();
    } else {
      setLoading(false);
    }
  }, []);
  
  const activeMembers = members.filter(m => !m.onProbation);
  const probationMembers = members.filter(m => m.onProbation);
  const unassignedMembers = activeMembers.filter(m => 
    !groups.some(g => g.some(gm => gm.id === m.id))
  );

  const filteredEvents = eventFilter === 'all' 
    ? events 
    : events.filter(e => e.type === eventFilter);

  const getRoleColor = (role) => {
    switch(role) {
      case 'TANK': return 'bg-green-500';
      case 'HEALER': return 'bg-yellow-500';
      case 'DPS': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getGroupComposition = (group) => {
    const tanks = group.filter(m => m.role === 'TANK').length;
    const healers = group.filter(m => m.role === 'HEALER').length;
    const dps = group.filter(m => m.role === 'DPS').length;
    return { tanks, healers, dps };
  };

  const getRosterStats = () => {
    const total = activeMembers.length;
    const tanks = activeMembers.filter(m => m.role === 'TANK').length;
    const healers = activeMembers.filter(m => m.role === 'HEALER').length;
    const dps = activeMembers.filter(m => m.role === 'DPS').length;
    const onDiscord = activeMembers.filter(m => m.onDiscord).length;
    return { total, tanks, healers, dps, onDiscord };
  };

  const getClassStats = () => {
    const stats = {};
    classNames.forEach(className => {
      stats[className] = activeMembers.filter(m => m.className === className).length;
    });
    return stats;
  };

// Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-white text-3xl font-bold mb-2">Throne and Liberty</h1>
            <h2 className="text-slate-400 text-xl">Roster Manager</h2>
          </div>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="px-4 py-3 bg-slate-700 text-white rounded mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button 
            onClick={handleLogin} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading roster data...</p>
        </div>
      </div>
    );
  }

  const stats = getRosterStats();
  const eventTypeStats = getEventTypeStats();
  const topParticipants = getTopParticipants();
  const classStats = getClassStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Users className="w-10 h-10" />
            Throne and Liberty Roster Manager
            {saving && <Loader className="w-6 h-6 text-blue-400 animate-spin" />}
          </h1>
          <p className="text-slate-400">Organize your guild and track event attendance</p>
          <button
            onClick={handleLogout}
            className="mt-2 text-slate-400 hover:text-white text-sm transition inline-flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'groups' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Grid className="w-5 h-5" />
            Group Manager
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'roster' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <List className="w-5 h-5" />
            Full Roster
          </button>
          <button
  onClick={() => setActiveTab('items')}
  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
    activeTab === 'items' 
      ? 'bg-blue-600 text-white' 
      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
  }`}
>
  <Package className="w-5 h-5" />
  Item Tracking
</button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'events' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Event Tracking
          </button>
        </div>

        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Add Member
              </h2>
              <input
                type="text"
                placeholder="Member name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMember()}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TANK">Tank</option>
                <option value="HEALER">Healer</option>
                <option value="DPS">DPS</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
              <button
                onClick={addMember}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
              >
                Add Member
              </button>

              <div className="mt-6 space-y-2">
                <button
                  onClick={autoAssign}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Auto-Assign Groups
                </button>
                <button
                  onClick={addGroup}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add New Group
                </button>
                <button
                  onClick={clearGroups}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition"
                >
                  Clear All Groups
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-white font-semibold mb-2">Unassigned ({unassignedMembers.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {unassignedMembers.map(member => (
                    <div key={member.id} className="bg-slate-700 p-2 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`${getRoleColor(member.role)} w-3 h-3 rounded-full`}></span>
                        <span className="text-white text-sm">{member.name}</span>
                        <span className="text-slate-400 text-xs">({member.role})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="mb-4 text-slate-400 text-sm">
                Total Groups: {groups.length} | Total Assigned: {groups.reduce((sum, g) => sum + g.length, 0)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group, groupIndex) => {
                  const comp = getGroupComposition(group);
                  const isBalanced = comp.tanks >= 1 && comp.healers >= 1;
                  
                  return (
                    <div key={groupIndex} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold text-lg">Group {groupIndex + 1}</h3>
                        <div className="flex items-center gap-2">
                          {!isBalanced && group.length > 0 && (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="text-slate-400 text-sm">
                            {group.length}/6
                          </span>
                          {groups.length > 1 && (
                            <button
                              onClick={() => removeGroup(groupIndex)}
                              className="text-red-400 hover:text-red-300 ml-2"
                              title="Delete group"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-400 mb-3">
                        T: {comp.tanks} | H: {comp.healers} | D: {comp.dps}
                      </div>

                      <div className="space-y-2 mb-3 min-h-[240px]">
                        {group.map(member => (
                          <div key={member.id} className="bg-slate-700 p-2 rounded flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`${getRoleColor(member.role)} w-3 h-3 rounded-full`}></span>
                              <span className="text-white text-sm">{member.name}</span>
                              <span className="text-slate-400 text-xs">({member.role})</span>
                            </div>
                            <button
                              onClick={() => removeFromGroup(member.id, groupIndex)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {group.length < 6 && (
                        <select
                          onChange={(e) => {
                            const member = unassignedMembers.find(m => m.id === e.target.value);
                            if (member) {
                              assignToGroup(member, groupIndex);
                              e.target.value = '';
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-700 text-white rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          defaultValue=""
                        >
                          <option value="" disabled>Add member...</option>
                          {unassignedMembers.map(member => (
                            <option key={member.id} value={member.id}>
                              {member.name} ({member.role})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roster' && (
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-slate-400">Total Active</div>
              </div>
              <div className="bg-green-900/30 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{stats.tanks}</div>
                <div className="text-sm text-slate-400">Tanks</div>
              </div>
              <div className="bg-yellow-900/30 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.healers}</div>
                <div className="text-sm text-slate-400">Healers</div>
              </div>
              <div className="bg-red-900/30 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-400">{stats.dps}</div>
                <div className="text-sm text-slate-400">DPS</div>
              </div>
              <div className="bg-blue-900/30 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.onDiscord}</div>
                <div className="text-sm text-slate-400">On Discord</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">Class Distribution</h3>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                {Object.entries(classStats).map(([className, count]) => (
                  count > 0 && (
                    <div key={className} className="bg-slate-700 p-2 rounded text-center">
                      <div className="text-lg font-bold text-purple-400">{count}</div>
                      <div className="text-xs text-slate-400">{className}</div>
                    </div>
                  )
                ))}
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-4">Active Roster</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 py-3 px-4">Name</th>
                    <th className="text-left text-slate-400 py-3 px-4">Role</th>
                    <th className="text-left text-slate-400 py-3 px-4">Weapon Combo</th>
                    <th className="text-left text-slate-400 py-3 px-4">Class Name</th>
                    <th className="text-left text-slate-400 py-3 px-4">Questlog</th>
                    <th className="text-center text-slate-400 py-3 px-4">Events</th>
                    <th className="text-center text-slate-400 py-3 px-4">Discord</th>
                    <th className="text-center text-slate-400 py-3 px-4">Probation</th>
                    <th className="text-center text-slate-400 py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMembers.map(member => {
                    const memberStats = getMemberStats(member.id);
                    return (
                      <tr key={member.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`${getRoleColor(member.role)} w-3 h-3 rounded-full`}></span>
                            <span className="text-white">{member.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={member.role}
                            onChange={(e) => updateMemberRole(member.id, e.target.value)}
                            className="w-full px-2 py-1 bg-slate-700 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="TANK">Tank</option>
                            <option value="HEALER">Healer</option>
                            <option value="DPS">DPS</option>
                            <option value="UNKNOWN">Unknown</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={member.weaponCombo}
                            onChange={(e) => updateWeaponCombo(member.id, e.target.value)}
                            className="w-full px-2 py-1 bg-slate-700 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select...</option>
                            {weaponCombos.map(combo => (
                              <option key={combo} value={combo}>{combo}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={member.className}
                            disabled
                            className="w-full px-2 py-1 bg-slate-600 text-slate-300 text-sm rounded cursor-not-allowed"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Build link..."
                            value={member.questlog}
                            onChange={(e) => updateQuestlog(member.id, e.target.value)}
                            className="w-full px-2 py-1 bg-slate-700 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-white font-semibold">{memberStats.total}</span>
                          <div className="text-xs text-slate-400">
                            AB:{memberStats.archboss} PVP:{memberStats.pvp} S:{memberStats.siege}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={member.onDiscord}
                            onChange={() => toggleDiscord(member.id)}
                            className="w-5 h-5 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={member.onProbation}
                            onChange={() => toggleProbation(member.id)}
                            className="w-5 h-5 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => removeMember(member.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {probationMembers.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-orange-400 mb-4 mt-8">On Probation ({probationMembers.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 py-3 px-4">Name</th>
                        <th className="text-left text-slate-400 py-3 px-4">Role</th>
                        <th className="text-left text-slate-400 py-3 px-4">Weapon Combo</th>
                        <th className="text-left text-slate-400 py-3 px-4">Class Name</th>
                        <th className="text-left text-slate-400 py-3 px-4">Questlog</th>
                        <th className="text-center text-slate-400 py-3 px-4">Discord</th>
                        <th className="text-center text-slate-400 py-3 px-4">Probation</th>
                        <th className="text-center text-slate-400 py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {probationMembers.map(member => (
                        <tr key={member.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 bg-orange-900/10">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`${getRoleColor(member.role)} w-3 h-3 rounded-full`}></span>
                              <span className="text-white">{member.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={member.role}
                              onChange={(e) => updateMemberRole(member.id, e.target.value)}
                              className="w-full px-2 py-1 bg-slate-700 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="TANK">Tank</option>
                              <option value="HEALER">Healer</option>
                              <option value="DPS">DPS</option>
                              <option value="UNKNOWN">Unknown</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={member.weaponCombo}
                              onChange={(e) => updateWeaponCombo(member.id, e.target.value)}
                              className="w-full px-2 py-1 bg-slate-700 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              {weaponCombos.map(combo => (
                                <option key={combo} value={combo}>{combo}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={member.className}
                              disabled
                              className="w-full px-2 py-1 bg-slate-600 text-slate-300 text-sm rounded cursor-not-allowed"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder="Build link..."
                              value={member.questlog}
                              onChange={(e) => updateQuestlog(member.id, e.target.value)}
                              className="w-full px-2 py-1 bg-slate-700 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={member.onDiscord}
                              onChange={() => toggleDiscord(member.id)}
                              className="w-5 h-5 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={member.onProbation}
                              onChange={() => toggleProbation(member.id)}
                              className="w-5 h-5 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => removeMember(member.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Log New Event</h2>
                
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="mb-3">
                  <div className="text-sm text-slate-400 mb-2">
                    Selected: {selectedAttendees.length} members
                  </div>
                  <div className="max-h-48 overflow-y-auto bg-slate-700 rounded p-3 space-y-2">
                    {activeMembers.map(member => (
                      <label key={member.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-600 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedAttendees.includes(member.id)}
                          onChange={() => toggleAttendee(member.id)}
                          className="w-4 h-4"
                        />
                        <span className={`${getRoleColor(member.role)} w-2 h-2 rounded-full`}></span>
                        <span className="text-white text-sm">{member.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={addEvent}
                  disabled={selectedAttendees.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-2 rounded font-semibold transition"
                >
                  Log Event
                </button>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top Participants
                </h2>
                <div className="space-y-2">
                  {topParticipants.map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between bg-slate-700 p-3 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold">#{index + 1}</span>
                        <span className={`${getRoleColor(member.role)} w-2 h-2 rounded-full`}></span>
                        <span className="text-white">{member.name}</span>
                      </div>
                      <span className="text-blue-400 font-bold">{member.eventCount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Event Statistics</h2>
                  <button
                    onClick={exportEventData}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-purple-900/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">{events.length}</div>
                    <div className="text-sm text-slate-400">Total Events</div>
                  </div>
                  <div className="bg-emerald-900/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-emerald-400">{eventTypeStats['Archboss']}</div>
                    <div className="text-sm text-slate-400">Archboss</div>
                  </div>
                  <div className="bg-rose-900/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-rose-400">{eventTypeStats['PVP Event']}</div>
                    <div className="text-sm text-slate-400">PVP Events</div>
                  </div>
                  <div className="bg-amber-900/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-amber-400">{eventTypeStats['Siege']}</div>
                    <div className="text-sm text-slate-400">Sieges</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Event History</h2>
                  <select
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Events</option>
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                      No events logged yet. Start tracking your guild activities!
                    </div>
                  ) : (
                    filteredEvents.map(event => (
                      <div key={event.id} className="bg-slate-700 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-white font-semibold">{event.type}</h3>
                            <p className="text-sm text-slate-400">{event.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-blue-400 font-bold">{event.attendeeCount} attendees</span>
                            <button
                              onClick={() => deleteEvent(event.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {event.attendees.map(attendeeId => {
                            const attendee = members.find(m => m.id === attendeeId);
                            return attendee ? (
                              <span key={attendeeId} className="px-2 py-1 bg-slate-600 text-white text-xs rounded">
                                {attendee.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

// 6. Add this tab content after your existing tab conditions (after activeTab === 'events'):
{activeTab === 'items' && (
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    {/* Left sidebar - Add item & Available members */}
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Add Item
        </h2>
        <input
          type="text"
          placeholder="Item name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
          className="w-full px-4 py-2 bg-slate-700 text-white rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={newItemType}
          onChange={(e) => setNewItemType(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 text-white rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {itemTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button
          onClick={addItem}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
        >
          Add Item
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-white font-semibold mb-3">Drag Members to Items</h3>
        <p className="text-slate-400 text-sm mb-3">Drag a member onto an item card to add them as a seeker</p>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activeMembers.map(member => (
            <div
              key={member.id}
              draggable
              onDragStart={() => handleDragStart(member)}
              className="bg-slate-700 p-3 rounded cursor-move hover:bg-slate-600 transition"
            >
              <div className="flex items-center gap-2">
                <span className={`${getRoleColor(member.role)} w-3 h-3 rounded-full`}></span>
                <span className="text-white text-sm">{member.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Right side - Item cards */}
    <div className="lg:col-span-3">
      <div className="mb-4 text-slate-400 text-sm">
        Total Items: {items.length}
      </div>
      
      {items.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No items tracked yet</p>
          <p className="text-slate-500 text-sm">Add items using the form on the left</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(item => {
            const receivedCount = item.seekers.filter(s => s.received).length;
            const totalSeekers = item.seekers.length;
            
            return (
              <div
                key={item.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id)}
                className="bg-slate-800 rounded-lg p-4 border-2 border-slate-700 hover:border-blue-500 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">{item.name}</h3>
                    <span className="inline-block px-2 py-1 bg-purple-600 text-white text-xs rounded">
                      {item.type}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-3 text-sm text-slate-400">
                  {receivedCount} / {totalSeekers} received
                </div>

                <div className="space-y-2">
                  {item.seekers.length === 0 ? (
                    <p className="text-slate-500 text-sm italic py-2">
                      Drag members here to add seekers
                    </p>
                  ) : (
                    item.seekers.map(seeker => {
                      const member = members.find(m => m.id === seeker.memberId);
                      if (!member) return null;
                      
                      return (
                        <div
                          key={seeker.memberId}
                          className={`p-2 rounded flex items-center justify-between ${
                            seeker.received 
                              ? 'bg-green-900/30 border border-green-700' 
                              : 'bg-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="checkbox"
                              checked={seeker.received}
                              onChange={() => toggleReceivedStatus(item.id, seeker.memberId)}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span className={`${getRoleColor(member.role)} w-2 h-2 rounded-full`}></span>
                            <span className={`text-sm ${seeker.received ? 'text-green-300 line-through' : 'text-white'}`}>
                              {member.name}
                            </span>
                          </div>
                          <button
                            onClick={() => removeSeekerFromItem(item.id, seeker.memberId)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default ThroneLibertyRoster;

