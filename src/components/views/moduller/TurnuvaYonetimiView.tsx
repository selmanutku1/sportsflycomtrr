import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  ShieldCheck,
  Medal,
  PlayCircle,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  X,
  Filter,
  Flame,
  Award,
  Swords,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Share2,
  Link2,
  QrCode,
  Copy,
  Check,
  Shuffle,
  Layers,
  SlidersHorizontal,
  Send,
  Mail,
  Smartphone,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  ArrowRight,
  UserCheck,
  CheckCheck,
  RotateCcw,
  Zap,
} from 'lucide-react';
import {
  TurnuvaItem,
  TurnuvaMacItem,
  TurnuvaTakimItem,
  TurnuvaBasvuruItem,
} from '../../../types';
import {
  getStoredTurnuvalar,
  saveStoredTurnuvalar,
} from '../../../data/modullerData';

interface TurnuvaYonetimiViewProps {
  onToast?: (msg: string) => void;
}

const BRANCHES = [
  'Tüm Branşlar',
  'Futbol',
  'Basketbol',
  'Voleybol',
  'Tenis',
  'Yüzme',
];

const STATUS_FILTERS = [
  { id: 'all', label: 'Tüm Durumlar' },
  { id: 'Kayıt Açık', label: 'Kayıt Açık' },
  { id: 'Devam Ediyor', label: 'Devam Ediyor' },
  { id: 'Planlandı', label: 'Planlandı' },
  { id: 'Tamamlandı', label: 'Tamamlandı' },
];

export const TurnuvaYonetimiView: React.FC<TurnuvaYonetimiViewProps> = ({
  onToast,
}) => {
  const [turnuvalar, setTurnuvalar] = useState<TurnuvaItem[]>(() =>
    getStoredTurnuvalar()
  );
  const [activeTurnuvaId, setActiveTurnuvaId] = useState<string>(
    () => turnuvalar[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<
    | 'fikstur'
    | 'bracket'
    | 'puan-durumu'
    | 'kura-cekimi'
    | 'katilim-linki'
    | 'takimlar'
  >('fikstur');

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>('Tüm Branşlar');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  // Modals
  const [showAddTurnuvaModal, setShowAddTurnuvaModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState<TurnuvaMacItem | null>(
    null
  );
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddApplicationModal, setShowAddApplicationModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Score Modal Form State
  const [scoreHome, setScoreHome] = useState<number>(0);
  const [scoreAway, setScoreAway] = useState<number>(0);
  const [matchStatus, setMatchStatus] = useState<
    'Oynanacak' | 'Canlı' | 'Bitti' | 'Ertelendi'
  >('Bitti');
  const [matchMvp, setMatchMvp] = useState('');
  const [matchReferee, setMatchReferee] = useState('');
  const [matchNotes, setMatchNotes] = useState('');
  // Volleyball / Tennis set scores
  const [vSet1Home, setVSet1Home] = useState<number>(25);
  const [vSet1Away, setVSet1Away] = useState<number>(21);
  const [vSet2Home, setVSet2Home] = useState<number>(25);
  const [vSet2Away, setVSet2Away] = useState<number>(18);
  const [vSet3Home, setVSet3Home] = useState<number>(0);
  const [vSet3Away, setVSet3Away] = useState<number>(0);
  // Basketball quarter scores
  const [bQ1Home, setBQ1Home] = useState<number>(18);
  const [bQ1Away, setBQ1Away] = useState<number>(14);
  const [bQ2Home, setBQ2Home] = useState<number>(16);
  const [bQ2Away, setBQ2Away] = useState<number>(16);
  const [bQ3Home, setBQ3Home] = useState<number>(20);
  const [bQ3Away, setBQ3Away] = useState<number>(12);
  const [bQ4Home, setBQ4Home] = useState<number>(14);
  const [bQ4Away, setBQ4Away] = useState<number>(12);

  // Draw Machine State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawProgress, setDrawProgress] = useState<number>(0);
  const [drawStepText, setDrawStepText] = useState<string>('');
  const [drawMethod, setDrawMethod] = useState<'seribasi' | 'tam-rastgele'>(
    'seribasi'
  );

  // New Tournament Form
  const [newTurnuva, setNewTurnuva] = useState<Partial<TurnuvaItem>>({
    name: '',
    organizerClub: 'DigiMondi',
    branch: 'Futbol',
    ageCategory: 'U14 Erkek',
    season: '2025-2026',
    startDate: '',
    endDate: '',
    location: 'Merkez Spor Kompleksi',
    status: 'Kayıt Açık',
    format: 'Grup + Eleme',
    maxTeams: 8,
    entryFee: 1500,
    registrationOpen: true,
    registrationDeadline: '',
    description: '',
  });

  // Manual Application Form
  const [newApp, setNewApp] = useState({
    teamName: '',
    clubName: '',
    contactName: '',
    phone: '',
    email: '',
    squadSize: 14,
    notes: '',
  });

  // Manual Team Form
  const [newTeam, setNewTeam] = useState({
    name: '',
    club: '',
    coachName: '',
    contactPhone: '',
    squadSize: 14,
    group: 'A Grubu',
  });

  const showNotification = (msg: string) => {
    if (onToast) onToast(msg);
  };

  // Filtered Tournaments list
  const filteredTurnuvalar = useMemo(() => {
    return turnuvalar.filter((t) => {
      const matchBranch =
        selectedBranch === 'Tüm Branşlar' || t.branch === selectedBranch;
      const matchStatus =
        statusFilter === 'all' || t.status === statusFilter;
      const matchSearch =
        searchQuery === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.organizerClub.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBranch && matchStatus && matchSearch;
    });
  }, [turnuvalar, selectedBranch, statusFilter, searchQuery]);

  const activeTurnuva = useMemo(() => {
    return (
      turnuvalar.find((t) => t.id === activeTurnuvaId) ||
      filteredTurnuvalar[0] ||
      turnuvalar[0]
    );
  }, [turnuvalar, activeTurnuvaId, filteredTurnuvalar]);

  // Groups extracted from teams
  const tournamentGroups = useMemo(() => {
    if (!activeTurnuva) return [];
    const grps = new Set<string>();
    activeTurnuva.teams.forEach((tm) => {
      if (tm.group) grps.add(tm.group);
    });
    return Array.from(grps).sort();
  }, [activeTurnuva]);

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    if (!activeTurnuva) return [];
    if (groupFilter === 'all') return activeTurnuva.matches;
    return activeTurnuva.matches.filter(
      (m) => m.group === groupFilter || m.stage === groupFilter
    );
  }, [activeTurnuva, groupFilter]);

  // Open Score Modal & Populate Specific Branch defaults
  const handleOpenScoreModal = (mac: TurnuvaMacItem) => {
    setShowScoreModal(mac);
    setScoreHome(mac.homeScore ?? 0);
    setScoreAway(mac.awayScore ?? 0);
    setMatchStatus(mac.status || 'Bitti');
    setMatchMvp(mac.mvp || '');
    setMatchReferee(mac.referee || '');
    setMatchNotes(mac.notes || '');

    if (mac.periodScores) {
      setBQ1Home(mac.periodScores.p1?.home ?? 18);
      setBQ1Away(mac.periodScores.p1?.away ?? 14);
      setBQ2Home(mac.periodScores.p2?.home ?? 16);
      setBQ2Away(mac.periodScores.p2?.away ?? 16);
      setBQ3Home(mac.periodScores.p3?.home ?? 20);
      setBQ3Away(mac.periodScores.p3?.away ?? 12);
      setBQ4Home(mac.periodScores.p4?.home ?? 14);
      setBQ4Away(mac.periodScores.p4?.away ?? 12);
    }
    if (mac.setScores && mac.setScores.length > 0) {
      setVSet1Home(mac.setScores[0]?.home ?? 25);
      setVSet1Away(mac.setScores[0]?.away ?? 21);
      setVSet2Home(mac.setScores[1]?.home ?? 25);
      setVSet2Away(mac.setScores[1]?.away ?? 18);
      setVSet3Home(mac.setScores[2]?.home ?? 0);
      setVSet3Away(mac.setScores[2]?.away ?? 0);
    }
  };

  // Save Match Score with Branch-Specific Puanlama & Standings
  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showScoreModal || !activeTurnuva) return;

    let finalHomeScore = scoreHome;
    let finalAwayScore = scoreAway;
    let periodData: any = undefined;
    let setData: any = undefined;

    if (activeTurnuva.branch === 'Basketbol') {
      finalHomeScore = bQ1Home + bQ2Home + bQ3Home + bQ4Home;
      finalAwayScore = bQ1Away + bQ2Away + bQ3Away + bQ4Away;
      periodData = {
        p1: { home: bQ1Home, away: bQ1Away },
        p2: { home: bQ2Home, away: bQ2Away },
        p3: { home: bQ3Home, away: bQ3Away },
        p4: { home: bQ4Home, away: bQ4Away },
      };
    } else if (activeTurnuva.branch === 'Voleybol') {
      let hSets = 0;
      let aSets = 0;
      const sets = [];
      if (vSet1Home > 0 || vSet1Away > 0) {
        sets.push({ home: vSet1Home, away: vSet1Away });
        if (vSet1Home > vSet1Away) hSets++;
        else if (vSet1Away > vSet1Home) aSets++;
      }
      if (vSet2Home > 0 || vSet2Away > 0) {
        sets.push({ home: vSet2Home, away: vSet2Away });
        if (vSet2Home > vSet2Away) hSets++;
        else if (vSet2Away > vSet2Home) aSets++;
      }
      if (vSet3Home > 0 || vSet3Away > 0) {
        sets.push({ home: vSet3Home, away: vSet3Away });
        if (vSet3Home > vSet3Away) hSets++;
        else if (vSet3Away > vSet3Home) aSets++;
      }
      finalHomeScore = hSets;
      finalAwayScore = aSets;
      setData = sets;
    }

    const updatedTurnuvalar = turnuvalar.map((t) => {
      if (t.id === activeTurnuva.id) {
        const updatedMatches = t.matches.map((m) => {
          if (m.id === showScoreModal.id) {
            return {
              ...m,
              homeScore: finalHomeScore,
              awayScore: finalAwayScore,
              status: matchStatus,
              mvp: matchMvp.trim() || undefined,
              referee: matchReferee.trim() || undefined,
              notes: matchNotes.trim() || undefined,
              periodScores: periodData,
              setScores: setData,
            };
          }
          return m;
        });

        // Recalculate standings table
        const teamStats: Record<
          string,
          {
            played: number;
            won: number;
            drawn: number;
            lost: number;
            gf: number;
            ga: number;
            pts: number;
            setsWon: number;
            setsLost: number;
          }
        > = {};

        t.teams.forEach((tm) => {
          teamStats[tm.name] = {
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            gf: 0,
            ga: 0,
            pts: 0,
            setsWon: 0,
            setsLost: 0,
          };
        });

        updatedMatches.forEach((m) => {
          if (
            m.status === 'Bitti' &&
            m.homeScore !== undefined &&
            m.awayScore !== undefined
          ) {
            const h = teamStats[m.homeTeam];
            const a = teamStats[m.awayTeam];
            if (h && a) {
              h.played += 1;
              a.played += 1;
              h.gf += m.homeScore;
              h.ga += m.awayScore;
              a.gf += m.awayScore;
              a.ga += m.homeScore;

              if (t.branch === 'Futbol') {
                if (m.homeScore > m.awayScore) {
                  h.won += 1;
                  h.pts += 3;
                  a.lost += 1;
                } else if (m.homeScore < m.awayScore) {
                  a.won += 1;
                  a.pts += 3;
                  h.lost += 1;
                } else {
                  h.drawn += 1;
                  a.drawn += 1;
                  h.pts += 1;
                  a.pts += 1;
                }
              } else if (t.branch === 'Basketbol') {
                if (m.homeScore > m.awayScore) {
                  h.won += 1;
                  h.pts += 2;
                  a.lost += 1;
                  a.pts += 1;
                } else if (m.homeScore < m.awayScore) {
                  a.won += 1;
                  a.pts += 2;
                  h.lost += 1;
                  h.pts += 1;
                }
              } else if (t.branch === 'Voleybol') {
                h.setsWon += m.homeScore;
                h.setsLost += m.awayScore;
                a.setsWon += m.awayScore;
                a.setsLost += m.homeScore;

                if (m.homeScore === 3 && (m.awayScore === 0 || m.awayScore === 1)) {
                  h.won += 1;
                  h.pts += 3;
                  a.lost += 1;
                  a.pts += 0;
                } else if (m.homeScore === 3 && m.awayScore === 2) {
                  h.won += 1;
                  h.pts += 2;
                  a.lost += 1;
                  a.pts += 1;
                } else if (m.awayScore === 3 && (m.homeScore === 0 || m.homeScore === 1)) {
                  a.won += 1;
                  a.pts += 3;
                  h.lost += 1;
                  h.pts += 0;
                } else if (m.awayScore === 3 && m.homeScore === 2) {
                  a.won += 1;
                  a.pts += 2;
                  h.lost += 1;
                  h.pts += 1;
                }
              } else {
                if (m.homeScore > m.awayScore) {
                  h.won += 1;
                  h.pts += 2;
                  a.lost += 1;
                } else if (m.homeScore < m.awayScore) {
                  a.won += 1;
                  a.pts += 2;
                  h.lost += 1;
                }
              }
            }
          }
        });

        const updatedTeams = t.teams
          .map((tm) => {
            const st = teamStats[tm.name];
            if (!st) return tm;
            return {
              ...tm,
              played: st.played,
              won: st.won,
              drawn: st.drawn,
              lost: st.lost,
              goalsFor: st.gf,
              goalsAgainst: st.ga,
              points: st.pts,
              setsWon: st.setsWon,
              setsLost: st.setsLost,
            };
          })
          .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            const avB = b.goalsFor - b.goalsAgainst;
            const avA = a.goalsFor - a.goalsAgainst;
            if (avB !== avA) return avB - avA;
            return b.goalsFor - a.goalsFor;
          });

        return {
          ...t,
          matches: updatedMatches,
          teams: updatedTeams,
        };
      }
      return t;
    });

    setTurnuvalar(updatedTurnuvalar);
    saveStoredTurnuvalar(updatedTurnuvalar);
    showNotification('Maç skoru ve branş puan durumu başarıyla güncellendi.');
    setShowScoreModal(null);
  };

  // Create New Tournament
  const handleCreateTurnuva = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTurnuva.name?.trim()) return;

    const slug = newTurnuva.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const defaultBanner =
      newTurnuva.branch === 'Futbol'
        ? 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80'
        : newTurnuva.branch === 'Voleybol'
        ? 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&auto=format&fit=crop&q=80'
        : newTurnuva.branch === 'Tenis'
        ? 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&auto=format&fit=crop&q=80'
        : newTurnuva.branch === 'Yüzme'
        ? 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&auto=format&fit=crop&q=80';

    const newItem: TurnuvaItem = {
      id: `trn-${Date.now()}`,
      name: newTurnuva.name.trim(),
      organizerClub: newTurnuva.organizerClub || 'DigiMondi',
      branch: newTurnuva.branch || 'Futbol',
      ageCategory: newTurnuva.ageCategory || 'U14 Erkek',
      season: newTurnuva.season || '2025-2026',
      startDate: newTurnuva.startDate || '10.11.2024',
      endDate: newTurnuva.endDate || '25.12.2024',
      location: newTurnuva.location || 'Merkez Spor Kompleksi',
      status: (newTurnuva.status as any) || 'Kayıt Açık',
      format: (newTurnuva.format as any) || 'Grup + Eleme',
      teamsCount: 4,
      maxTeams: newTurnuva.maxTeams || 8,
      entryFee: newTurnuva.entryFee || 1500,
      registrationOpen: newTurnuva.registrationOpen ?? true,
      registrationDeadline: newTurnuva.registrationDeadline || '01.11.2024',
      registrationSlug: slug,
      description:
        newTurnuva.description ||
        'Kulüp ve sporcular için resmi fikstür ve puanlama portalı.',
      bannerUrl: defaultBanner,
      teams: [
        {
          id: `t1-${Date.now()}`,
          name: `${newTurnuva.organizerClub} A Takımı`,
          club: newTurnuva.organizerClub || 'DigiMondi',
          group: 'A Grubu',
          seed: 1,
          coachName: 'Ali Koç',
          contactPhone: '+90 532 100 2030',
          squadSize: 14,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        },
        {
          id: `t2-${Date.now()}`,
          name: 'Saraçgym Gelişim',
          club: 'Saraçgym',
          group: 'A Grubu',
          seed: 2,
          coachName: 'Emre Koç',
          contactPhone: '+90 533 200 3040',
          squadSize: 14,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        },
        {
          id: `t3-${Date.now()}`,
          name: 'aicosports Yıldızlar',
          club: 'aicosports',
          group: 'B Grubu',
          seed: 1,
          coachName: 'Murat Sarı',
          contactPhone: '+90 534 300 4050',
          squadSize: 14,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        },
        {
          id: `t4-${Date.now()}`,
          name: 'Marmara GSK',
          club: 'Marmara GSK',
          group: 'B Grubu',
          seed: 2,
          coachName: 'Kemal Tekin',
          contactPhone: '+90 535 400 5060',
          squadSize: 14,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        },
      ],
      matches: [
        {
          id: `m1-${Date.now()}`,
          turnuvaId: `trn-${Date.now()}`,
          round: '1. Hafta',
          stage: 'Grup',
          group: 'A Grubu',
          date: '10.11.2024',
          time: '14:00',
          venue: 'Saha 1',
          court: 'Ana Saha',
          homeTeam: `${newTurnuva.organizerClub} A Takımı`,
          awayTeam: 'Saraçgym Gelişim',
          status: 'Oynanacak',
        },
        {
          id: `m2-${Date.now()}`,
          turnuvaId: `trn-${Date.now()}`,
          round: '1. Hafta',
          stage: 'Grup',
          group: 'B Grubu',
          date: '10.11.2024',
          time: '16:00',
          venue: 'Saha 1',
          court: 'Ana Saha',
          homeTeam: 'aicosports Yıldızlar',
          awayTeam: 'Marmara GSK',
          status: 'Oynanacak',
        },
      ],
      applications: [],
    };

    const updated = [newItem, ...turnuvalar];
    setTurnuvalar(updated);
    saveStoredTurnuvalar(updated);
    setActiveTurnuvaId(newItem.id);
    setShowAddTurnuvaModal(false);
    showNotification(`"${newItem.name}" başarıyla oluşturuldu.`);
  };

  // Approve Application & Add Directly to Tournament Teams
  const handleApproveApplication = (app: TurnuvaBasvuruItem) => {
    if (!activeTurnuva) return;

    const newTeamItem: TurnuvaTakimItem = {
      id: `tm-${Date.now()}`,
      name: app.teamName,
      club: app.clubName,
      coachName: app.contactName,
      contactPhone: app.phone,
      squadSize: app.squadSize,
      group:
        activeTurnuva.teams.length % 2 === 0 ? 'A Grubu' : 'B Grubu',
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    };

    const updatedTurnuvalar = turnuvalar.map((t) => {
      if (t.id === activeTurnuva.id) {
        const updatedApps = (t.applications || []).map((a) =>
          a.id === app.id ? { ...a, status: 'Onaylandı' as const } : a
        );
        return {
          ...t,
          teams: [...t.teams, newTeamItem],
          teamsCount: t.teams.length + 1,
          applications: updatedApps,
        };
      }
      return t;
    });

    setTurnuvalar(updatedTurnuvalar);
    saveStoredTurnuvalar(updatedTurnuvalar);
    showNotification(
      `${app.teamName} başvurusu onaylandı ve turnuva takım kadrosuna eklendi.`
    );
  };

  // Reject Application
  const handleRejectApplication = (appId: string) => {
    if (!activeTurnuva) return;
    const updatedTurnuvalar = turnuvalar.map((t) => {
      if (t.id === activeTurnuva.id) {
        const updatedApps = (t.applications || []).map((a) =>
          a.id === appId ? { ...a, status: 'Reddedildi' as const } : a
        );
        return {
          ...t,
          applications: updatedApps,
        };
      }
      return t;
    });
    setTurnuvalar(updatedTurnuvalar);
    saveStoredTurnuvalar(updatedTurnuvalar);
    showNotification('Başvuru reddedildi.');
  };

  // Add Manual Application
  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTurnuva || !newApp.teamName.trim()) return;

    const item: TurnuvaBasvuruItem = {
      id: `app-${Date.now()}`,
      turnuvaId: activeTurnuva.id,
      teamName: newApp.teamName.trim(),
      clubName: newApp.clubName.trim() || 'Bağımsız Kulüp',
      contactName: newApp.contactName.trim() || 'Sorumlu Antrenör',
      phone: newApp.phone.trim() || '+90 500 000 0000',
      email: newApp.email.trim() || 'kulup@example.com',
      squadSize: Number(newApp.squadSize) || 14,
      notes: newApp.notes.trim() || undefined,
      appliedAt: new Date().toLocaleDateString('tr-TR'),
      status: 'Bekliyor',
      registrationCode: `TRN-REG-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    const updatedTurnuvalar = turnuvalar.map((t) => {
      if (t.id === activeTurnuva.id) {
        return {
          ...t,
          applications: [item, ...(t.applications || [])],
        };
      }
      return t;
    });

    setTurnuvalar(updatedTurnuvalar);
    saveStoredTurnuvalar(updatedTurnuvalar);
    setShowAddApplicationModal(false);
    setNewApp({
      teamName: '',
      clubName: '',
      contactName: '',
      phone: '',
      email: '',
      squadSize: 14,
      notes: '',
    });
    showNotification('Yeni başvuru kaydı alındı.');
  };

  // Add Manual Team to Roster
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTurnuva || !newTeam.name.trim()) return;

    const item: TurnuvaTakimItem = {
      id: `tm-${Date.now()}`,
      name: newTeam.name.trim(),
      club: newTeam.club.trim() || newTeam.name.trim(),
      coachName: newTeam.coachName.trim() || undefined,
      contactPhone: newTeam.contactPhone.trim() || undefined,
      squadSize: Number(newTeam.squadSize) || 14,
      group: newTeam.group,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    };

    const updatedTurnuvalar = turnuvalar.map((t) => {
      if (t.id === activeTurnuva.id) {
        return {
          ...t,
          teams: [...t.teams, item],
          teamsCount: t.teams.length + 1,
        };
      }
      return t;
    });

    setTurnuvalar(updatedTurnuvalar);
    saveStoredTurnuvalar(updatedTurnuvalar);
    setShowAddTeamModal(false);
    setNewTeam({
      name: '',
      club: '',
      coachName: '',
      contactPhone: '',
      squadSize: 14,
      group: 'A Grubu',
    });
    showNotification(`${item.name} turnuvaya eklendi.`);
  };

  // Draw Machine Simulation (Automated Fixture & Seed Pairing)
  const handleStartDraw = () => {
    if (!activeTurnuva || activeTurnuva.teams.length < 2) {
      showNotification('Kura çekimi için en az 2 kayıtlı takım gereklidir.');
      return;
    }

    setIsDrawing(true);
    setDrawProgress(15);
    setDrawStepText('Torbalar hazırlanıyor ve seribaşı takımlar belirleniyor...');

    setTimeout(() => {
      setDrawProgress(45);
      setDrawStepText('Kura topları karıştırılıyor...');
    }, 700);

    setTimeout(() => {
      setDrawProgress(75);
      setDrawStepText('Gruplar ve eşleşme fikstürü oluşturuluyor...');
    }, 1400);

    setTimeout(() => {
      setDrawProgress(100);
      setDrawStepText('Kura çekimi tamamlandı!');

      // Shuffle teams and assign to Groups or Knockout pairings
      const shuffled = [...activeTurnuva.teams].sort(() => Math.random() - 0.5);
      const groupCount = activeTurnuva.teams.length >= 6 ? 2 : 1;

      const updatedTeams = shuffled.map((tm, idx) => {
        const grp = groupCount === 2 ? (idx % 2 === 0 ? 'A Grubu' : 'B Grubu') : 'A Grubu';
        return {
          ...tm,
          group: grp,
          seed: idx + 1,
        };
      });

      // Generate round-robin or knockout match schedule
      const newMatches: TurnuvaMacItem[] = [];
      const courts = ['Saha 1', 'Saha 2', 'Merkez Kort', 'A Salonu'];

      if (activeTurnuva.format === 'Tek Maç Eleme') {
        // Quarter finals or Semi finals
        for (let i = 0; i < updatedTeams.length; i += 2) {
          if (updatedTeams[i + 1]) {
            const matchIndex = Math.floor(i / 2) + 1;
            newMatches.push({
              id: `m-draw-${Date.now()}-${i}`,
              turnuvaId: activeTurnuva.id,
              round: updatedTeams.length > 4 ? `Çeyrek Final ${matchIndex}` : `Yarı Final ${matchIndex}`,
              stage: 'Eleme',
              bracketMatchId: updatedTeams.length > 4 ? `QF-${matchIndex}` : `SF-${matchIndex}`,
              date: '15.11.2024',
              time: `${10 + matchIndex * 2}:00`,
              venue: activeTurnuva.location,
              court: courts[matchIndex % courts.length],
              homeTeam: updatedTeams[i].name,
              awayTeam: updatedTeams[i + 1].name,
              status: 'Oynanacak',
            });
          }
        }
      } else {
        // Group Stage matches
        const groupA = updatedTeams.filter((t) => t.group === 'A Grubu');
        const groupB = updatedTeams.filter((t) => t.group === 'B Grubu');

        const createGroupPairs = (grpTeams: TurnuvaTakimItem[], grpName: string) => {
          for (let i = 0; i < grpTeams.length; i++) {
            for (let j = i + 1; j < grpTeams.length; j++) {
              newMatches.push({
                id: `m-draw-${grpName}-${i}-${j}-${Date.now()}`,
                turnuvaId: activeTurnuva.id,
                round: `${newMatches.length + 1}. Hafta`,
                stage: 'Grup',
                group: grpName,
                date: '10.11.2024',
                time: `${11 + (newMatches.length % 4) * 2}:00`,
                venue: activeTurnuva.location,
                court: courts[newMatches.length % courts.length],
                homeTeam: grpTeams[i].name,
                awayTeam: grpTeams[j].name,
                status: 'Oynanacak',
              });
            }
          }
        };

        if (groupA.length > 0) createGroupPairs(groupA, 'A Grubu');
        if (groupB.length > 0) createGroupPairs(groupB, 'B Grubu');
      }

      const updatedTurnuvalar = turnuvalar.map((t) => {
        if (t.id === activeTurnuva.id) {
          return {
            ...t,
            teams: updatedTeams,
            matches: newMatches.length > 0 ? newMatches : t.matches,
          };
        }
        return t;
      });

      setTurnuvalar(updatedTurnuvalar);
      saveStoredTurnuvalar(updatedTurnuvalar);
      setIsDrawing(false);
      showNotification(
        'Kura çekimi başarıyla tamamlandı, gruplar ve maç fikstürü oluşturuldu.'
      );
    }, 2200);
  };

  // Copy Public Link
  const handleCopyLink = () => {
    const slug =
      activeTurnuva?.registrationSlug ||
      activeTurnuva?.id ||
      'turnuva-katilim';
    const link = `https://sportsfly.app/turnuva/katilim/${slug}`;
    navigator.clipboard?.writeText(link);
    setCopiedLink(true);
    showNotification('Turnuva katılım bağlantısı panoya kopyalandı.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentRegistrationUrl = `https://sportsfly.app/turnuva/katilim/${
    activeTurnuva?.registrationSlug || activeTurnuva?.id || '2026'
  }`;

  return (
    <div className="min-h-full flex flex-col bg-slate-50/50 dark:bg-[#0b1320] text-slate-800 dark:text-slate-100 antialiased">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-[#111c2e] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <span>Modüller</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  Turnuva &amp; Lig Yönetimi
                </span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  {activeTurnuva?.branch || 'Branş Seçimi'}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Turnuva &amp; Lig Yönetimi
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Resmi Fikstür &amp; Kura Sistemi
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Branş bazlı turnuvalar, otomatik kura çekimi, eleme ağaçları,
                katılım bağlantıları ve resmi skor tablosu.
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setShowShareModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Katılım Linki Paylaş</span>
              </button>

              <button
                onClick={() => setShowAddTurnuvaModal(true)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Turnuva Başlat</span>
              </button>
            </div>
          </div>

          {/* Branch Filter & Status Filter Bar */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Branch Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {BRANCHES.map((b) => {
                const isSelected = selectedBranch === b;
                return (
                  <button
                    key={b}
                    onClick={() => setSelectedBranch(b)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>

            {/* Search & Status Filter */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Turnuva ara..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300"
              >
                {STATUS_FILTERS.map((sf) => (
                  <option key={sf.id} value={sf.id}>
                    {sf.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tournament Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-3 scrollbar-none">
            {filteredTurnuvalar.map((trn) => {
              const isSelected = trn.id === activeTurnuva?.id;
              return (
                <button
                  key={trn.id}
                  onClick={() => setActiveTurnuvaId(trn.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Trophy
                    className={`w-3.5 h-3.5 ${
                      isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                    }`}
                  />
                  <span>{trn.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      isSelected
                        ? 'bg-blue-800 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {trn.branch}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tournament Workspace */}
      {activeTurnuva ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
          {/* Active Tournament Hero Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-blue-900/60 border border-blue-700/50">
                    {activeTurnuva.branch}
                  </span>
                  <span>•</span>
                  <span>{activeTurnuva.ageCategory}</span>
                  <span>•</span>
                  <span>{activeTurnuva.season}</span>
                  <span>•</span>
                  <span className="text-slate-300">
                    Format: {activeTurnuva.format}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {activeTurnuva.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {activeTurnuva.description}
                </p>

                <div className="flex items-center gap-4 pt-2 text-xs text-slate-300 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{activeTurnuva.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      {activeTurnuva.startDate} - {activeTurnuva.endDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      {activeTurnuva.teams.length} /{' '}
                      {activeTurnuva.maxTeams || 8} Takım
                    </span>
                  </div>
                </div>
              </div>

              {/* Tournament KPIs & Fast Control Box */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Toplam Maç
                  </span>
                  <span className="text-lg font-black text-white">
                    {activeTurnuva.matches.length}
                  </span>
                </div>
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tamamlanan
                  </span>
                  <span className="text-lg font-black text-emerald-400">
                    {
                      activeTurnuva.matches.filter((m) => m.status === 'Bitti')
                        .length
                    }
                  </span>
                </div>
                <div className="text-center p-2 rounded-xl bg-white/5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Başvurular
                  </span>
                  <span className="text-lg font-black text-amber-400">
                    {activeTurnuva.applications?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
            {[
              {
                id: 'fikstur',
                label: `Fikstür & Maçlar (${activeTurnuva.matches.length})`,
                icon: Calendar,
              },
              {
                id: 'bracket',
                label: 'Eleme Ağacı',
                icon: Layers,
              },
              {
                id: 'puan-durumu',
                label: `Puan Tablosu (${activeTurnuva.teams.length})`,
                icon: Award,
              },
              {
                id: 'kura-cekimi',
                label: 'Kura Çekimi & Eşleştirme',
                icon: Shuffle,
              },
              {
                id: 'katilim-linki',
                label: `Başvurular (${activeTurnuva.applications?.length || 0})`,
                icon: Link2,
              },
              {
                id: 'takimlar',
                label: `Takımlar (${activeTurnuva.teams.length})`,
                icon: Users,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: FİKSTÜR & MAÇLAR */}
          {activeTab === 'fikstur' && (
            <div className="space-y-4">
              {/* Group Filter for matches */}
              {tournamentGroups.length > 0 && (
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-xs font-bold text-slate-500">
                    Grup / Aşama:
                  </span>
                  <button
                    onClick={() => setGroupFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      groupFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    Tüm Maçlar
                  </button>
                  {tournamentGroups.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGroupFilter(g)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        groupFilter === g
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                  <button
                    onClick={() => setGroupFilter('Eleme')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      groupFilter === 'Eleme'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    Eleme Aşaması
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMatches.map((mac) => {
                  const isFinished = mac.status === 'Bitti';
                  const isLive = mac.status === 'Canlı';

                  return (
                    <div
                      key={mac.id}
                      className="bg-white dark:bg-[#111c2e] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 transition-all"
                    >
                      {/* Match Header */}
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-200">
                            {mac.round}
                          </span>
                          {mac.group && (
                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                              {mac.group}
                            </span>
                          )}
                          <span>•</span>
                          <span>{mac.venue}</span>
                          {mac.court && <span>({mac.court})</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {mac.date} {mac.time}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isFinished
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                                : isLive
                                ? 'bg-rose-500 text-white animate-pulse'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {mac.status}
                          </span>
                        </div>
                      </div>

                      {/* Teams & Score Row */}
                      <div className="grid grid-cols-3 items-center text-center py-2.5 bg-slate-50 dark:bg-[#162238] rounded-xl px-3 border border-slate-100 dark:border-slate-800">
                        {/* Home Team */}
                        <div className="text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {mac.homeTeam}
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center justify-center">
                          {isFinished || isLive ? (
                            <div className="font-black text-lg text-blue-600 dark:text-blue-400">
                              {mac.homeScore} : {mac.awayScore}
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">
                              VS
                            </span>
                          )}
                          {/* Sub Score Breakdown (Quarter / Set) */}
                          {mac.setScores && mac.setScores.length > 0 && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {mac.setScores
                                .map((s) => `${s.home}-${s.away}`)
                                .join(' | ')}
                            </div>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="text-right font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {mac.awayTeam}
                        </div>
                      </div>

                      {/* Match Footer & Quick Edit Button */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                          {mac.mvp
                            ? `Maçın Oyuncusu: ${mac.mvp}`
                            : mac.referee
                            ? `Hakem: ${mac.referee}`
                            : 'Skor / Sonuç girişi hazır'}
                        </div>
                        <button
                          onClick={() => handleOpenScoreModal(mac)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Skor / Durum Gir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ELEME AĞACI (BRACKET TREE) */}
          {activeTab === 'bracket' && (
            <div className="bg-white dark:bg-[#111c2e] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    Eleme Aşaması &amp; Şampiyonluk Ağacı
                  </h3>
                  <p className="text-xs text-slate-500">
                    Eleme turları, yarı final ve şampiyonluk maçı akışı.
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg border border-blue-200 dark:border-blue-800">
                  {activeTurnuva.branch} Eleme Formatı
                </span>
              </div>

              {/* Interactive Visual Bracket */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Column 1: Çeyrek / Yarı Finaller */}
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center pb-2 border-b border-slate-200 dark:border-slate-800">
                    Yarı Final
                  </div>
                  {activeTurnuva.matches
                    .filter((m) => m.stage === 'Eleme')
                    .slice(0, 2)
                    .map((m, idx) => (
                      <div
                        key={m.id}
                        className="bg-slate-50 dark:bg-[#162238] p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2"
                      >
                        <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                          <span>{m.round}</span>
                          <span>{m.status}</span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="truncate">{m.homeTeam}</span>
                            <span className="text-blue-600 font-mono">
                              {m.homeScore ?? '-'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="truncate">{m.awayTeam}</span>
                            <span className="text-blue-600 font-mono">
                              {m.awayScore ?? '-'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenScoreModal(m)}
                          className="w-full py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg text-center"
                        >
                          Skor Düzenle
                        </button>
                      </div>
                    ))}
                </div>

                {/* Column 2: Büyük Final */}
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-500 text-center pb-2 border-b border-slate-200 dark:border-slate-800">
                    Büyük Final (Şampiyonluk)
                  </div>
                  {activeTurnuva.matches
                    .filter((m) => m.stage === 'Final' || m.round.includes('Final'))
                    .slice(0, 1)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="bg-amber-500/5 dark:bg-amber-950/20 p-4 rounded-2xl border-2 border-amber-400/50 shadow-md space-y-3"
                      >
                        <div className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            {m.round}
                          </span>
                          <span>{m.status}</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                            <span className="truncate">{m.homeTeam}</span>
                            <span className="text-amber-600 font-mono text-sm">
                              {m.homeScore ?? '-'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                            <span className="truncate">{m.awayTeam}</span>
                            <span className="text-amber-600 font-mono text-sm">
                              {m.awayScore ?? '-'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenScoreModal(m)}
                          className="w-full py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-center"
                        >
                          Final Skorunu Gir
                        </button>
                      </div>
                    ))}
                </div>

                {/* Column 3: Şampiyon & Kupa Kürsüsü */}
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-500 text-center pb-2 border-b border-slate-200 dark:border-slate-800">
                    Kupa &amp; Madalya
                  </div>
                  <div className="bg-emerald-500/5 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                      <Medal className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        {activeTurnuva.teams[0]?.name || 'Lider Takım'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {activeTurnuva.teams[0]?.club}
                      </p>
                      <p className="text-[11px] font-bold text-emerald-600 mt-1">
                        Turnuva Lideri (
                        {activeTurnuva.teams[0]?.points || 0} Puan)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PUAN DURUMU */}
          {activeTab === 'puan-durumu' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#111c2e] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      {activeTurnuva.branch} Resmi Puan Tablosu
                    </h3>
                    <p className="text-xs text-slate-500">
                      {activeTurnuva.branch === 'Futbol' &&
                        'Galibiyet: 3 Puan, Beraberlik: 1 Puan, Mağlubiyet: 0 Puan'}
                      {activeTurnuva.branch === 'Basketbol' &&
                        'Galibiyet: 2 Puan, Mağlubiyet: 1 Puan'}
                      {activeTurnuva.branch === 'Voleybol' &&
                        '3-0/3-1: 3 Puan, 3-2: 2 Puan (Kazanan) / 1 Puan (Kaybeden)'}
                      {activeTurnuva.branch === 'Tenis' &&
                        'Galibiyet: 2 Puan, Set & Oyun averajı'}
                      {activeTurnuva.branch === 'Yüzme' &&
                        'Zaman derecesi ve madalya puanı'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                    Toplam {activeTurnuva.teams.length} Takım
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#162238] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
                        <th className="py-3 px-4 w-12 text-center">Sıra</th>
                        <th className="py-3 px-4">Takım</th>
                        {activeTurnuva.branch === 'Voleybol' && (
                          <>
                            <th className="py-3 px-3 text-center">Set A</th>
                            <th className="py-3 px-3 text-center">Set V</th>
                          </>
                        )}
                        <th className="py-3 px-3 text-center">O</th>
                        <th className="py-3 px-3 text-center">G</th>
                        <th className="py-3 px-3 text-center">B</th>
                        <th className="py-3 px-3 text-center">M</th>
                        <th className="py-3 px-3 text-center">A</th>
                        <th className="py-3 px-3 text-center">Y</th>
                        <th className="py-3 px-3 text-center">AV</th>
                        <th className="py-3 px-4 text-center font-black">PUAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeTurnuva.teams.map((tm, index) => {
                        const av = tm.goalsFor - tm.goalsAgainst;
                        return (
                          <tr
                            key={tm.id}
                            className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40"
                          >
                            <td className="py-3 px-4 text-center font-bold">
                              {index === 0 ? (
                                <span className="w-6 h-6 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-xs font-black">
                                  1
                                </span>
                              ) : index === 1 ? (
                                <span className="w-6 h-6 rounded-full bg-slate-400 text-white inline-flex items-center justify-center text-xs font-black">
                                  2
                                </span>
                              ) : index === 2 ? (
                                <span className="w-6 h-6 rounded-full bg-amber-700 text-white inline-flex items-center justify-center text-xs font-black">
                                  3
                                </span>
                              ) : (
                                index + 1
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              <div>{tm.name}</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                {tm.club} • Koç: {tm.coachName || 'Atanmadı'}
                              </div>
                            </td>
                            {activeTurnuva.branch === 'Voleybol' && (
                              <>
                                <td className="py-3 px-3 text-center font-semibold text-emerald-600">
                                  {tm.setsWon ?? 0}
                                </td>
                                <td className="py-3 px-3 text-center font-semibold text-rose-600">
                                  {tm.setsLost ?? 0}
                                </td>
                              </>
                            )}
                            <td className="py-3 px-3 text-center">{tm.played}</td>
                            <td className="py-3 px-3 text-center font-semibold text-emerald-600">
                              {tm.won}
                            </td>
                            <td className="py-3 px-3 text-center">{tm.drawn}</td>
                            <td className="py-3 px-3 text-center font-semibold text-rose-600">
                              {tm.lost}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-500">
                              {tm.goalsFor}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-500">
                              {tm.goalsAgainst}
                            </td>
                            <td
                              className={`py-3 px-3 text-center font-semibold ${
                                av >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {av > 0 ? `+${av}` : av}
                            </td>
                            <td className="py-3 px-4 text-center font-black text-sm text-blue-600 dark:text-blue-400">
                              {tm.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KURA ÇEKİMİ & EŞLEŞTİRME */}
          {activeTab === 'kura-cekimi' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#111c2e] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Shuffle className="w-5 h-5 text-blue-600" />
                      Kura Çekimi &amp; Otomatik Fikstür Sihirbazı
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Kayıtlı takımları torbalara ayırın, seribaşı kurası çekin
                      veya tek tıkla rastgele eşleşmeler üretin.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={drawMethod}
                      onChange={(e) => setDrawMethod(e.target.value as any)}
                      className="px-3 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="seribasi">Seribaşı + Torba Sistemi</option>
                      <option value="tam-rastgele">Tam Rastgele Kura</option>
                    </select>

                    <button
                      disabled={isDrawing}
                      onClick={handleStartDraw}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Shuffle className={`w-4 h-4 ${isDrawing ? 'animate-spin' : ''}`} />
                      <span>{isDrawing ? 'Kura Çekiliyor...' : 'Kura Çekimini Başlat'}</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar during draw */}
                {isDrawing && (
                  <div className="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                      <span>{drawStepText}</span>
                      <span>%{drawProgress}</span>
                    </div>
                    <div className="w-full h-2 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${drawProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Torbalar / Gruplar Dağılımı */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Torba 1 / Grup A */}
                  <div className="bg-slate-50 dark:bg-[#162238] p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        A Grubu / 1. Torba Takımları
                      </span>
                      <span className="text-slate-400">
                        {
                          activeTurnuva.teams.filter(
                            (t) => !t.group || t.group === 'A Grubu'
                          ).length
                        }{' '}
                        Takım
                      </span>
                    </div>
                    <div className="space-y-2">
                      {activeTurnuva.teams
                        .filter((t) => !t.group || t.group === 'A Grubu')
                        .map((tm, idx) => (
                          <div
                            key={tm.id}
                            className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {tm.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {tm.club}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Torba 2 / Grup B */}
                  <div className="bg-slate-50 dark:bg-[#162238] p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        B Grubu / 2. Torba Takımları
                      </span>
                      <span className="text-slate-400">
                        {
                          activeTurnuva.teams.filter(
                            (t) => t.group === 'B Grubu'
                          ).length
                        }{' '}
                        Takım
                      </span>
                    </div>
                    <div className="space-y-2">
                      {activeTurnuva.teams
                        .filter((t) => t.group === 'B Grubu')
                        .map((tm, idx) => (
                          <div
                            key={tm.id}
                            className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {tm.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {tm.club}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KATILIM BAĞLANTISI & BAŞVURULAR */}
          {activeTab === 'katilim-linki' && (
            <div className="space-y-6">
              {/* Public Registration Link Banner */}
              <div className="bg-white dark:bg-[#111c2e] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-blue-600" />
                      Turnuva Katılım &amp; Başvuru Bağlantısı
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kulüplere ve antrenörlere bu bağlantıyı göndererek online
                      kayıt başvurularını toplayabilirsiniz.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddApplicationModal(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Manuel Başvuru Ekle</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#162238] p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    readOnly
                    value={currentRegistrationUrl}
                    className="w-full bg-transparent text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-hidden"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedLink ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
              </div>

              {/* Incoming Applications List */}
              <div className="bg-white dark:bg-[#111c2e] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Gelen Takım Kayıt Başvuruları (
                    {activeTurnuva.applications?.length || 0})
                  </h4>
                  <span className="text-xs text-slate-400">
                    Son Kayıt:{' '}
                    {activeTurnuva.registrationDeadline || 'Belirtilmedi'}
                  </span>
                </div>

                {activeTurnuva.applications &&
                activeTurnuva.applications.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeTurnuva.applications.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {app.teamName}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({app.clubName})
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                app.status === 'Onaylandı'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : app.status === 'Reddedildi'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                            <span>Yetkili: {app.contactName}</span>
                            <span>Tel: {app.phone}</span>
                            <span>Kadro: {app.squadSize} Sporcu</span>
                            <span>Kod: {app.registrationCode}</span>
                          </div>
                          {app.notes && (
                            <p className="text-xs text-slate-400 italic">
                              "{app.notes}"
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        {app.status === 'Bekliyor' && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleRejectApplication(app.id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 transition-colors"
                            >
                              Reddet
                            </button>
                            <button
                              onClick={() => handleApproveApplication(app)}
                              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Onayla &amp; Takımlara Ekle</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Henüz bekleyen başvuru bulunmuyor. Katılım bağlantısını
                    paylaşarak başvuruları kabul edebilirsiniz.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: TAKIMLAR & KADROLAR */}
          {activeTab === 'takimlar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  Toplam {activeTurnuva.teams.length} Kayıtlı Takım
                </span>
                <button
                  onClick={() => setShowAddTeamModal(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Takım Ekle</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTurnuva.teams.map((tm) => (
                  <div
                    key={tm.id}
                    className="bg-white dark:bg-[#111c2e] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {tm.name}
                        </h4>
                        <p className="text-xs text-slate-500">{tm.club}</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Antrenör: {tm.coachName || 'Belirtilmedi'}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-bold text-[10px] rounded-full border border-blue-200 dark:border-blue-800">
                        {tm.group || 'Grup Atanmadı'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                      <span>Kadro: {tm.squadSize || 14} Sporcu</span>
                      <span className="font-black text-blue-600 dark:text-blue-400">
                        {tm.points} Puan ({tm.played} Maç)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400">
          Turnuva bulunamadı. Yeni bir turnuva başlatabilirsiniz.
        </div>
      )}

      {/* MODAL 1: Branşa Özel Skor & Detay Gir */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit className="w-4 h-4 text-blue-600" />
                  Maç Skoru &amp; Sonuç Girişi
                </h3>
                <p className="text-xs text-slate-400">
                  {showScoreModal.homeTeam} vs {showScoreModal.awayTeam}
                </p>
              </div>
              <button
                onClick={() => setShowScoreModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScore} className="space-y-4 text-xs">
              {/* Branch-Specific Input Structure */}
              {activeTurnuva?.branch === 'Basketbol' ? (
                <div className="space-y-3 bg-slate-50 dark:bg-[#162238] p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                    Basketbol Çeyrek Skorları (Q1 - Q4)
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center font-bold">
                    <div></div>
                    <div>1. Çeyrek</div>
                    <div>2. Çeyrek</div>
                    <div>3. Çeyrek</div>
                    <div>4. Çeyrek</div>

                    <div className="truncate text-left font-bold text-slate-700 dark:text-slate-300">
                      {showScoreModal.homeTeam}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={bQ1Home}
                      onChange={(e) => setBQ1Home(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />
                    <input
                      type="number"
                      min="0"
                      value={bQ2Home}
                      onChange={(e) => setBQ2Home(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />
                    <input
                      type="number"
                      min="0"
                      value={bQ3Home}
                      onChange={(e) => setBQ3Home(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />
                    <input
                      type="number"
                      min="0"
                      value={bQ4Home}
                      onChange={(e) => setBQ4Home(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />

                    <div className="truncate text-left font-bold text-slate-700 dark:text-slate-300">
                      {showScoreModal.awayTeam}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={bQ1Away}
                      onChange={(e) => setBQ1Away(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />
                    <input
                      type="number"
                      min="0"
                      value={bQ2Away}
                      onChange={(e) => setBQ2Away(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />
                    <input
                      type="number"
                      min="0"
                      value={bQ3Away}
                      onChange={(e) => setBQ3Away(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />
                    <input
                      type="number"
                      min="0"
                      value={bQ4Away}
                      onChange={(e) => setBQ4Away(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm text-blue-600">
                    <span>Toplam:</span>
                    <span>
                      {bQ1Home + bQ2Home + bQ3Home + bQ4Home} -{' '}
                      {bQ1Away + bQ2Away + bQ3Away + bQ4Away}
                    </span>
                  </div>
                </div>
              ) : activeTurnuva?.branch === 'Voleybol' ? (
                <div className="space-y-3 bg-slate-50 dark:bg-[#162238] p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
                    Voleybol Set Skorları
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center font-bold">
                    <div></div>
                    <div>1. Set</div>
                    <div>2. Set</div>
                    <div>3. Set (Gerekirse)</div>

                    <div className="truncate text-left font-bold text-slate-700 dark:text-slate-300">
                      {showScoreModal.homeTeam}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={vSet1Home}
                      onChange={(e) => setVSet1Home(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />
                    <input
                      type="number"
                      min="0"
                      value={vSet2Home}
                      onChange={(e) => setVSet2Home(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />
                    <input
                      type="number"
                      min="0"
                      value={vSet3Home}
                      onChange={(e) => setVSet3Home(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />

                    <div className="truncate text-left font-bold text-slate-700 dark:text-slate-300">
                      {showScoreModal.awayTeam}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={vSet1Away}
                      onChange={(e) => setVSet1Away(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />
                    <input
                      type="number"
                      min="0"
                      value={vSet2Away}
                      onChange={(e) => setVSet2Away(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />
                    <input
                      type="number"
                      min="0"
                      value={vSet3Away}
                      onChange={(e) => setVSet3Away(Number(e.target.value))}
                      className="text-center py-1 bg-white dark:bg-[#0b1320] border rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-[#162238] p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 truncate">
                      {showScoreModal.homeTeam}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={scoreHome}
                      onChange={(e) => setScoreHome(Number(e.target.value))}
                      className="w-full text-center font-black text-2xl py-2 bg-white dark:bg-[#0b1320] border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 truncate text-right">
                      {showScoreModal.awayTeam}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={scoreAway}
                      onChange={(e) => setScoreAway(Number(e.target.value))}
                      className="w-full text-center font-black text-2xl py-2 bg-white dark:bg-[#0b1320] border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Match Status */}
              <div>
                <label className="block font-bold mb-1">Maç Durumu</label>
                <select
                  value={matchStatus}
                  onChange={(e) => setMatchStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Bitti">Bitti (Sonuçlandı)</option>
                  <option value="Canlı">Canlı Oynanıyor</option>
                  <option value="Oynanacak">Oynanacak</option>
                  <option value="Ertelendi">Ertelendi</option>
                </select>
              </div>

              {/* Referee & MVP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Hakem</label>
                  <input
                    type="text"
                    value={matchReferee}
                    onChange={(e) => setMatchReferee(e.target.value)}
                    placeholder="Hakem Adı"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Maçın Oyuncusu (MVP)</label>
                  <input
                    type="text"
                    value={matchMvp}
                    onChange={(e) => setMatchMvp(e.target.value)}
                    placeholder="Sporcu Adı"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScoreModal(null)}
                  className="px-3.5 py-2 text-slate-500 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Skoru Kaydet &amp; Puanları Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Paylaşım & QR Kodu Modalı */}
      {showShareModal && activeTurnuva && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                Turnuva Katılım Bağlantısı
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center p-4 bg-slate-50 dark:bg-[#162238] rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl shadow-xs flex items-center justify-center border border-slate-200">
                <QrCode className="w-28 h-28 text-slate-900" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {activeTurnuva.name}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Kayıt Ücreti: {activeTurnuva.entryFee || 0} TL • Son Başvuru:{' '}
                  {activeTurnuva.registrationDeadline || 'Açık'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={currentRegistrationUrl}
                className="w-full bg-transparent text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-hidden"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `${activeTurnuva.name} katılım başvurusu için bağlantı: ${currentRegistrationUrl}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-4 h-4" />
                <span>WhatsApp Paylaş</span>
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(
                  activeTurnuva.name + ' Turnuva Kaydı'
                )}&body=${encodeURIComponent(
                  `Turnuva katılım formuna ulaşmak için tıklayın: ${currentRegistrationUrl}`
                )}`}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold flex items-center justify-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                <span>E-posta Gönder</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Yeni Turnuva Başlat (Branşa Göre) */}
      {showAddTurnuvaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Yeni Turnuva / Lig Başlat
                </h3>
                <p className="text-xs text-slate-400">
                  Spor branşı kurallarına göre organizasyon oluşturun.
                </p>
              </div>
              <button
                onClick={() => setShowAddTurnuvaModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTurnuva} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Turnuva Adı *</label>
                <input
                  type="text"
                  required
                  value={newTurnuva.name || ''}
                  onChange={(e) =>
                    setNewTurnuva({ ...newTurnuva, name: e.target.value })
                  }
                  placeholder="Örn: 2026 İstanbul Kış Voleybol Şampiyonası"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Spor Branşı *</label>
                  <select
                    value={newTurnuva.branch}
                    onChange={(e) =>
                      setNewTurnuva({ ...newTurnuva, branch: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="Futbol">Futbol</option>
                    <option value="Basketbol">Basketbol</option>
                    <option value="Voleybol">Voleybol</option>
                    <option value="Tenis">Tenis</option>
                    <option value="Yüzme">Yüzme</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Yaş Kategorisi</label>
                  <input
                    type="text"
                    value={newTurnuva.ageCategory || ''}
                    onChange={(e) =>
                      setNewTurnuva({
                        ...newTurnuva,
                        ageCategory: e.target.value,
                      })
                    }
                    placeholder="U14 Erkek / Yıldızlar"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Turnuva Formatı</label>
                  <select
                    value={newTurnuva.format}
                    onChange={(e) =>
                      setNewTurnuva({
                        ...newTurnuva,
                        format: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Grup + Eleme">Grup Aşaması + Eleme</option>
                    <option value="Lig Usulü">Lig Usulü (Tek/Çift Devre)</option>
                    <option value="Tek Maç Eleme">Tek Maç Eleme (Playoff)</option>
                    <option value="Seri & Kulvar">Seri &amp; Kulvar (Yüzme/Bireysel)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Maksimum Takım Sayısı</label>
                  <input
                    type="number"
                    min="2"
                    max="32"
                    value={newTurnuva.maxTeams || 8}
                    onChange={(e) =>
                      setNewTurnuva({
                        ...newTurnuva,
                        maxTeams: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Başlangıç - Bitiş Tarihi</label>
                  <input
                    type="text"
                    value={newTurnuva.startDate || ''}
                    onChange={(e) =>
                      setNewTurnuva({
                        ...newTurnuva,
                        startDate: e.target.value,
                      })
                    }
                    placeholder="10.11.2024"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Katılım Ücreti (TL)</label>
                  <input
                    type="number"
                    value={newTurnuva.entryFee || 1500}
                    onChange={(e) =>
                      setNewTurnuva({
                        ...newTurnuva,
                        entryFee: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Tesis / Salon / Kort</label>
                <input
                  type="text"
                  value={newTurnuva.location || ''}
                  onChange={(e) =>
                    setNewTurnuva({ ...newTurnuva, location: e.target.value })
                  }
                  placeholder="Merkez Spor Kompleksi"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTurnuvaModal(false)}
                  className="px-3 py-2 text-slate-500 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Turnuvayı Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Manuel Başvuru Ekle */}
      {showAddApplicationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Manuel Takım Başvurusu Ekle
              </h3>
              <button
                onClick={() => setShowAddApplicationModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Takım Adı *</label>
                <input
                  type="text"
                  required
                  value={newApp.teamName}
                  onChange={(e) =>
                    setNewApp({ ...newApp, teamName: e.target.value })
                  }
                  placeholder="Örn: Beylikdüzü FK U12"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Kulüp / Kurum</label>
                <input
                  type="text"
                  value={newApp.clubName}
                  onChange={(e) =>
                    setNewApp({ ...newApp, clubName: e.target.value })
                  }
                  placeholder="Beylikdüzü SK"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Yetkili / Koç</label>
                  <input
                    type="text"
                    value={newApp.contactName}
                    onChange={(e) =>
                      setNewApp({ ...newApp, contactName: e.target.value })
                    }
                    placeholder="Ad Soyad"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Telefon</label>
                  <input
                    type="text"
                    value={newApp.phone}
                    onChange={(e) =>
                      setNewApp({ ...newApp, phone: e.target.value })
                    }
                    placeholder="+90 5XX XXX XX XX"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Notlar / Lisans Bilgisi</label>
                <textarea
                  rows={2}
                  value={newApp.notes}
                  onChange={(e) =>
                    setNewApp({ ...newApp, notes: e.target.value })
                  }
                  placeholder="Sağlık raporları tamamlandı..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddApplicationModal(false)}
                  className="px-3 py-2 text-slate-500 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Başvuruyu Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Manuel Takım Ekle */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Turnuvaya Takım Ekle
              </h3>
              <button
                onClick={() => setShowAddTeamModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Takım Adı *</label>
                <input
                  type="text"
                  required
                  value={newTeam.name}
                  onChange={(e) =>
                    setNewTeam({ ...newTeam, name: e.target.value })
                  }
                  placeholder="Örn: Anadolu Parsları"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Kulüp Adı</label>
                <input
                  type="text"
                  value={newTeam.club}
                  onChange={(e) =>
                    setNewTeam({ ...newTeam, club: e.target.value })
                  }
                  placeholder="Anadolu GSK"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Antrenör Adı</label>
                  <input
                    type="text"
                    value={newTeam.coachName}
                    onChange={(e) =>
                      setNewTeam({ ...newTeam, coachName: e.target.value })
                    }
                    placeholder="Oğuz Acar"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Grup Ataması</label>
                  <select
                    value={newTeam.group}
                    onChange={(e) =>
                      setNewTeam({ ...newTeam, group: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  >
                    <option value="A Grubu">A Grubu</option>
                    <option value="B Grubu">B Grubu</option>
                    <option value="C Grubu">C Grubu</option>
                    <option value="D Grubu">D Grubu</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-3 py-2 text-slate-500 font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Takımı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
