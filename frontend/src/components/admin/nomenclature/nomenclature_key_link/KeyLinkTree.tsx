import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert, Box, Button, CircularProgress, Paper, Snackbar, Typography,
  Collapse, IconButton, Tooltip, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { searchFamilies } from '../family/familyApi';
import { searchNomenclatureKeys } from '../nomenclature_key/nomenclature_keyApi';
import {
  fetchKeyLinks1, fetchKeyLinks2, fetchKeyLinks3,
  type KeyLink,
} from './keyLinkApi';
import {
  KEY_LINK_QK, useKeyLink1Mutations, useKeyLink2Mutations, useKeyLink3Mutations,
} from './useKeyLinkMutations';
import { KeyLinkForm } from './KeyLinkForm';
import { DeleteConfirmDialog } from '../_shared/DeleteConfirmDialog';
import { AsyncAutocomplete, type AsyncOption } from '../_shared/AsyncAutocomplete';
import { axiosInstance } from '../../../../api/axiosInstance';
import { BASE_URL } from '../../../../utils/eNums';
import useString from '../../../../hooks/useString';
import cfl from '../../../../utils/capitalizeFirstLetter';
import nomenclatureStrings from '../_shared/nomenclatureStrings';

const fetchStatusTypes = async () => {
  const res = await axiosInstance.get(`${BASE_URL}/nomenclature/key-links/status-types`);
  return (res.data ?? []) as { id: number; name_u: string; name_e: string }[];
};

interface TreeNodeProps {
  node: KeyLink;
  level: number;
  children: KeyLink[];
  onEdit: (node: KeyLink, level: number) => void;
  onDelete: (node: KeyLink, level: number) => void;
  onAddChild: (parentId: number, level: number) => void;
  expanded: boolean;
  onToggle: () => void;
  getString: (key: string) => string;
}

function TreeNode({ node, level, children, onEdit, onDelete, onAddChild, expanded, onToggle, getString }: TreeNodeProps) {
  const hasChildren = children.length > 0;
  const canHaveChildren = level < 3;
  const indent = (level - 1) * 28;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5, pl: `${indent}px`, gap: 0.5,
        '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}>
        {canHaveChildren && (
          <IconButton size="small" onClick={onToggle}>
            {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        )}
        {!canHaveChildren && <Box sx={{ width: 28 }} />}
        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 60 }}>
          L{level}
        </Typography>
        <Chip size="small" label={node.key_name || `ID ${node.key_id}`} sx={{ fontWeight: 600 }} />
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          {node.status_name || '-'}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={getString('edit') || 'Edit'}>
          <span>
            <IconButton size="small" onClick={() => onEdit(node, level)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={getString('delete') || 'Delete'}>
          <span>
            <IconButton size="small" color="error" onClick={() => onDelete(node, level)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        {canHaveChildren && (
          <Tooltip title={`Add L${level + 1}`}>
            <span>
              <IconButton size="small" color="primary" onClick={() => onAddChild(node.id, level)}>
                <AddIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
      {canHaveChildren && (
        <Collapse in={expanded}>
          {hasChildren ? (
            children.map((child) => (
              <NodeWrapper key={child.id} node={child} level={level + 1}
                onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} getString={getString} />
            ))
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ pl: `${indent + 28}px`, py: 0.5, display: 'block' }}>
              {getString('no_children') || 'no children'}
            </Typography>
          )}
        </Collapse>
      )}
    </Box>
  );
}

function NodeWrapper({ node, level, onEdit, onDelete, onAddChild, getString }: {
  node: KeyLink; level: number;
  onEdit: (node: KeyLink, level: number) => void;
  onDelete: (node: KeyLink, level: number) => void;
  onAddChild: (parentId: number, level: number) => void;
  getString: (key: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const childrenQk = [...KEY_LINK_QK, `level${level + 1}`, node.id] as const;
  const fetcher = level === 2 ? fetchKeyLinks3 : fetchKeyLinks2;
  const { data: children = [] } = useQuery({
    queryKey: childrenQk,
    queryFn: () => fetcher(node.id),
    enabled: expanded,
    staleTime: 2 * 60 * 1000,
  });

  return (
    <TreeNode
      node={node} level={level} children={children}
      onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild}
      expanded={expanded} onToggle={() => setExpanded((p) => !p)}
      getString={getString}
    />
  );
}

export function KeyLinkTree() {
  const getString = useString({ str: nomenclatureStrings });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [selectedFamily, setSelectedFamily] = useState<AsyncOption | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<KeyLink | null>(null);
  const [formLevel, setFormLevel] = useState(1);
  const [formParentId, setFormParentId] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ node: KeyLink; level: number } | null>(null);

  const selectedFamilyId = selectedFamily?.id ?? null;

  const { data: statusTypes = [], isLoading: statusLoading } = useQuery({
    queryKey: ['key_link_status_types'],
    queryFn: fetchStatusTypes,
    staleTime: 5 * 60 * 1000,
  });

  const searchFamilyOptions = async (q: string): Promise<AsyncOption[]> =>
    (await searchFamilies(q)).map((f) => ({ id: f.id, label: f.name }));

  const searchKeyOptions = async (q: string): Promise<AsyncOption[]> =>
    (await searchNomenclatureKeys(q)).map((k) => ({ id: k.id, label: k.name }));

  const { data: l1 = [], isLoading: l1Loading } = useQuery({
    queryKey: [...KEY_LINK_QK, 'level1', selectedFamilyId],
    queryFn: () => fetchKeyLinks1(selectedFamilyId ?? undefined),
    enabled: !!selectedFamilyId,
    staleTime: 2 * 60 * 1000,
  });

  const l1Mutations = useKeyLink1Mutations({ setSnackbar, onSuccess: () => setFormOpen(false) });
  const l2Mutations = useKeyLink2Mutations({ setSnackbar, onSuccess: () => setFormOpen(false) });
  const l3Mutations = useKeyLink3Mutations({ setSnackbar, onSuccess: () => setFormOpen(false) });

  const getMutations = (level: number) => {
    if (level === 2) return l2Mutations;
    if (level === 3) return l3Mutations;
    return l1Mutations;
  };

  const handleAddRoot = () => {
    if (!selectedFamilyId) return;
    setEditing(null);
    setFormLevel(1);
    setFormParentId(selectedFamilyId);
    setFormOpen(true);
  };

  const handleAddChild = (parentId: number, level: number) => {
    setEditing(null);
    setFormLevel(level + 1);
    setFormParentId(parentId);
    setFormOpen(true);
  };

  const handleEdit = (node: KeyLink, level: number) => {
    setEditing(node);
    setFormLevel(level);
    setFormParentId(node.parent_id);
    setFormOpen(true);
  };

  const handleDelete = (node: KeyLink, level: number) => {
    setDeleteTarget({ node, level });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const m = getMutations(deleteTarget.level);
    m.deleteMutation.mutate(deleteTarget.node.id);
    setDeleteTarget(null);
  };

  const statusOptions = statusTypes.map((s) => ({
    id: s.id,
    label: s.name_u || s.name_e || String(s.id),
  }));

  const loading = statusLoading;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" fontWeight={600}>
          {cfl(getString('key_tree') || 'key tree')}
        </Typography>
        <AsyncAutocomplete
          label={cfl(getString('family')) || 'family'}
          sx={{ minWidth: 280, flexGrow: 1, maxWidth: 480 }}
          valueId={selectedFamilyId}
          valueLabel={selectedFamily?.label ?? null}
          search={searchFamilyOptions}
          onChange={(o) => setSelectedFamily(o)}
        />
        {selectedFamilyId && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRoot} size="small">
            Add L1
          </Button>
        )}
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}

      {!loading && !selectedFamilyId && (
        <Typography color="text.secondary" sx={{ p: 2 }}>
          {cfl(getString('select_family_to_view_keys') || 'Select a family to view its key tree')}
        </Typography>
      )}

      {!loading && selectedFamilyId && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 1 }}>
          {l1Loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>
          ) : l1.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              {cfl(getString('no_level1_keys') || 'No level 1 keys. Click "Add L1" to create one.')}
            </Typography>
          ) : (
            l1.map((node) => (
              <NodeWrapper key={node.id} node={node} level={1}
                onEdit={handleEdit} onDelete={handleDelete} onAddChild={handleAddChild}
                getString={getString} />
            ))
          )}
        </Paper>
      )}

      {formOpen && (
        <KeyLinkForm
          open={formOpen} level={formLevel} editing={editing} parentId={formParentId}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          createMutation={(getMutations(formLevel) as any).createMutation}
          updateMutation={(getMutations(formLevel) as any).updateMutation}
          statusOptions={statusOptions} searchKeys={searchKeyOptions}
        />
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        label={deleteTarget ? (deleteTarget.node.key_name || `ID ${deleteTarget.node.id}`) : undefined}
        isPending={deleteTarget ? getMutations(deleteTarget.level).deleteMutation.isPending : false}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
