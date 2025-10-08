import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, RefreshCw, AlertCircle, List, Grid, Calendar, TrendingUp, Download, Save, Loader, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';

const ThroneLibertyRoster = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
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
    'Crossbow + Dagger',
    'Crossbow + Greatsword',
    'Crossbow + Sword & Shield',
    'Crossbow + Longbow',
    'Crossbow + Staff',
    'Crossbow + Wand & Tome',
    'Greatsword + Wand & Tome',
    'Greatsword + Dagger',
    'Greatsword + Sword & Shield',
    'Greatsword + Longbow',
    'Greatsword + Staff',
    'Sword & Shield + Dagger',
    'Sword & Shield + Longbow',
    'Sword & Shield + Staff',
    'Sword & Shield + Wand & Tome',
    'Longbow + Dagger',
    'Longbow + Staff',
    'Longbow + Wand & Tome',
    'Staff + Dagger',
    'Staff + Wand & Tome',
    'Wand & Tome + Dagger',
    'Spear + Crossbow',
    'Spear + Dagger',
    'Spear + Greatsword',
    'Spear + Longbow',
    'Spear + Staff',
    'Spear + Sword & Shield',
    'Spear + Wand & Tome',
    'Orb + Crossbow',
    'Orb + Dagger',
    'Orb + Greatsword',
    'Orb + Longbow',
    'Orb + Staff',
    'Orb + Spear',
    'Orb + Sword & Shield',
    'Orb + Wand & Tome'
  ];

  const weaponToClass = {
    'Crossbow + Dagger': 'Scorpion',
    'Crossbow + Greatsword': 'Outrider',
    'Crossbow + Sword & Shield': 'Raider',
    'Crossbow + Longbow': 'Scout',
    'Crossbow + Staff': 'Battleweaver',
    'Crossbow + Wand & Tome': 'Fury',
    'Greatsword + Wand & Tome': 'Paladin',
    'Greatsword + Dagger': 'Ravager',
    'Greatsword + Sword & Shield': 'Crusader',
    'Greatsword + Longbow': 'Ranger',
    'Greatsword + Staff': 'Sentinel',
    'Sword & Shield + Dagger': 'Berserker',
    'Sword & Shield + Longbow': 'Warden',
    'Sword & Shield + Staff': 'Disciple',
    'Sword & Shield + Wand & Tome': 'Templar',
    'Longbow + Dagger': 'Infiltrator',
    'Longbow + Staff': 'Liberator',
    'Longbow + Wand & Tome': 'Seeker',
    'Staff + Dagger': 'Spellblade',
    'Staff + Wand & Tome': 'Invocator',
    'Wand & Tome + Dagger': 'Darkblighter',
    'Spear + Crossbow': 'Cavalier',
    'Spear + Dagger': 'Shadowdancer',
    'Spear + Greatsword': 'Gladiator',
    'Spear + Longbow': 'Impaler',
    'Spear + Staff': 'Eradicator',
    'Spear + Sword & Shield': 'Steelheart',
    'Spear + Wand & Tome': 'Voidlance',
    'Orb + Crossbow': 'Crucifix',
    'Orb + Dagger': 'Lunarch',
    'Orb + Greatsword': 'Justicar',
    'Orb + Longbow': 'Scryer',
    'Orb + Staff': 'Enigma',
    'Orb + Spear': 'Polaris',
    'Orb + Sword & Shield': 'Guardian',
    'Orb + Wand & Tome': 'Oracle'
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

 const loadData = async () => {
  setLoading(true);
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

    // NEW: Load groups AFTER members are loaded
    await loadGroupsFromDB(membersData);

  } catch (error) {
    console.error('Error loading data:', error);
    alert('Error loading data. Please refresh the page.');
  } finally {
    setLoading(false);
  }
};

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
    // Keep default 4 empty groups if load fails
  }
};
// 3. ADD this new function after loadGroupsFromDB
const saveGroups = async (newGroups) => {
  setSaving(true);
  try {
    // Delete existing groups
    await supabase.from('groups').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
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

// 4. REPLACE addGroup function (around line 233)
const addGroup = async () => {
  await saveGroups([...groups, []]);
};

// 5. REPLACE removeGroup function (around line 237)
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

// 6. REPLACE assignToGroup function (around line 362)
const assignToGroup = async (member, groupIndex) => {
  if (groups[groupIndex].length >= 6 || member.onProbation) return;
  
  const newGroups = groups.map((g, i) => 
    i === groupIndex ? [...g, member] : g.filter(m => m.id !== member.id)
  );
  await saveGroups(newGroups);
};

// 7. REPLACE removeFromGroup function (around line 370)
const removeFromGroup = async (memberId, groupIndex) => {
  const newGroups = [...groups];
  newGroups[groupIndex] = newGroups[groupIndex].filter(m => m.id !== memberId);
  await saveGroups(newGroups);
};

// 8. REPLACE autoAssign function (around line 376)
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

        {/* Rest of your existing code continues here - the tabs and all content */}
