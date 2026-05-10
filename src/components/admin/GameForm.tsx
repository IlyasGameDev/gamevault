'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';
import { Category, GameFormData, GameWithCategories } from '@/lib/types/database';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import FileUploader from './FileUploader';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { ExternalLink, Eye } from 'lucide-react';

interface GameFormProps {
  game?: GameWithCategories;
  categories: Category[];
}

const DEFAULT: GameFormData = {
  title: '', slug: '', description: '', instructions: '',
  developer: '', developer_url: '', game_type: 'iframe', iframe_url: '',
  thumbnail_url: '', cover_url: '', category_ids: [], tags: [],
  width: 960, height: 640, orientation: 'landscape', status: 'draft', is_featured: false,
};

export default function GameForm({ game, categories }: GameFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<GameFormData>(
    game
      ? {
          ...DEFAULT,
          title: game.title,
          slug: game.slug,
          description: game.description ?? '',
          instructions: game.instructions ?? '',
          developer: game.developer ?? '',
          developer_url: game.developer_url ?? '',
          game_type: game.game_type,
          iframe_url: game.iframe_url ?? '',
          thumbnail_url: game.thumbnail_url ?? '',
          cover_url: game.cover_url ?? '',
          width: game.width,
          height: game.height,
          orientation: game.orientation,
          status: game.status,
          is_featured: game.is_featured,
          category_ids: game.categories?.map((c) => c.id) ?? [],
          tags: game.tags ?? [],
        }
      : DEFAULT
  );
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const isEdit = !!game;

  function set(key: keyof GameFormData, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(title: string) {
    set('title', title);
    if (!isEdit) set('slug', slugify(title, { lower: true, strict: true }));
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  }

  function toggleCategory(id: string) {
    set('category_ids',
      form.category_ids.includes(id)
        ? form.category_ids.filter((c) => c !== id)
        : [...form.category_ids, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEdit ? `/api/games/${game!.id}` : '/api/games';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const { data, error } = await res.json();
      if (error) throw new Error(error);
      toast.success(isEdit ? 'Game updated!' : 'Game created!');
      router.push('/admin/games');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save game';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Basic Info</h2>
        <Input label="Title *" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
        <Input label="Slug *" value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-[#1a1d2e] border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 resize-none text-sm"
            placeholder="Brief description of the game..."
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-300">Instructions</label>
          <textarea
            value={form.instructions}
            onChange={(e) => set('instructions', e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-[#1a1d2e] border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 resize-none text-sm"
            placeholder="How to play..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Developer" value={form.developer} onChange={(e) => set('developer', e.target.value)} />
          <Input label="Developer URL" type="url" value={form.developer_url} onChange={(e) => set('developer_url', e.target.value)} />
        </div>
      </section>

      {/* Game type */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Game Source</h2>
        <div className="flex gap-4">
          {(['iframe', 'hosted'] as const).map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio" name="game_type" value={type}
                checked={form.game_type === type}
                onChange={() => set('game_type', type)}
                className="accent-indigo-500"
              />
              <span className="text-sm text-gray-300 capitalize">
                {type === 'iframe' ? 'Embed from URL (iframe)' : 'Upload Game Files (WebGL/HTML5)'}
              </span>
            </label>
          ))}
        </div>
        {form.game_type === 'iframe' ? (
          <div className="space-y-2">
            <Input
              label="Source URL *" type="url" placeholder="https://example.com/game"
              value={form.iframe_url} onChange={(e) => set('iframe_url', e.target.value)}
            />
            {form.iframe_url && (
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setPreviewOpen(true)}>
                  <Eye size={14} /> Preview in modal
                </Button>
                <a href={form.iframe_url} target="_blank" rel="noopener noreferrer">
                  <Button type="button" variant="ghost" size="sm">
                    <ExternalLink size={14} /> Open in tab
                  </Button>
                </a>
              </div>
            )}
          </div>
        ) : (
          <FileUploader slug={form.slug} type="game" accept=".zip,.html" label="Game Files (ZIP or HTML)" onUploaded={(url) => set('game_file_path', url)} />
        )}
      </section>

      {/* Media */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Media</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUploader slug={form.slug} type="thumbnail" label="Thumbnail *" onUploaded={(url) => set('thumbnail_url', url)} />
          <FileUploader slug={form.slug} type="cover" label="Cover Image (for featured banner)" onUploaded={(url) => set('cover_url', url)} />
        </div>
        {form.thumbnail_url && (
          <Input label="Thumbnail URL (current)" value={form.thumbnail_url} onChange={(e) => set('thumbnail_url', e.target.value)} />
        )}
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Categories *</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id} type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                form.category_ids.includes(cat.id)
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Tags */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Tags</h2>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="Type a tag and press Enter"
            className="flex-1"
          />
          <Button type="button" variant="secondary" onClick={addTag}>Add</Button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-[#252840] rounded-full text-sm text-gray-300">
                #{tag}
                <button type="button" onClick={() => set('tags', form.tags.filter((t) => t !== tag))} className="text-gray-500 hover:text-white">×</button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Settings */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Settings</h2>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Width (px)" type="number" value={form.width} onChange={(e) => set('width', parseInt(e.target.value))} />
          <Input label="Height (px)" type="number" value={form.height} onChange={(e) => set('height', parseInt(e.target.value))} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Orientation</label>
            <select
              value={form.orientation}
              onChange={(e) => set('orientation', e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1a1d2e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Status</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1a1d2e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set('is_featured', !form.is_featured)}
                className={`w-11 h-6 rounded-full transition-colors ${form.is_featured ? 'bg-indigo-600' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 m-0.5 rounded-full bg-white transition-transform ${form.is_featured ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm text-gray-300">Featured game</span>
            </label>
          </div>
        </div>
      </section>

      <div className="flex gap-3 pt-4 border-t border-white/10">
        <Button type="submit" loading={loading} size="lg">
          {isEdit ? 'Save Changes' : 'Create Game'}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {/* iframe preview modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Game Preview" size="xl">
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
          {form.iframe_url && (
            <iframe
              src={form.iframe_url}
              className="w-full h-full border-0"
              allow="fullscreen; autoplay; gamepad"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              title="Game Preview"
            />
          )}
        </div>
      </Modal>
    </form>
  );
}
