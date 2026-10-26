/* Supabase adapter. SDK is loaded only when cloud storage is selected. */
(function (root) {
  'use strict';
  function validateConfig(config) {
    const url = new URL(config.url);
    if (url.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) || url.pathname !== '/' || url.username || url.password || url.search || url.hash)
      throw new Error('Use the HTTPS project URL from Supabase.');
    if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(config.key))
      throw new Error('Use a publishable key starting sb_publishable_. Never enter a secret or service role key.');
    return {url:url.origin, key:config.key};
  }
  async function loadSDK() {
    if (root.supabase?.createClient) return root.supabase;
    await new Promise((resolve,reject) => {
      const script=document.createElement('script');
      script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js';
      script.onload=resolve; script.onerror=()=>{script.remove();reject(new Error('Cloud sign-in could not load. Check your connection and retry.'));};
      document.head.append(script);
    });
    if (!root.supabase?.createClient) throw new Error('Cloud SDK unavailable.');
    return root.supabase;
  }
  class ClosetCloud {
    constructor(client, user, onError, ownerId = user.id) {
      this.client=client; this.user=user; this.onError=onError; this.ownerId=ownerId; this.role=ownerId === user.id ? "master" : "sub";
      this.photos=new Map(); this.subscriptions=new Set(); this.closed=false;
      this.bucket=client.storage.from('closet-photos');
      this.assets={upload:blob=>this.upload(blob),delete:id=>this.removePhoto(id),download:id=>this.download(id)};
    }
    path(id) {
      if (!id.startsWith('cloud:'+this.ownerId+'/')) throw new Error('This photo belongs to a different closet. Import a portable backup with embedded photos.');
      return id.slice(6);
    }
    async download(id) {
      const {data,error}=await this.bucket.download(this.path(id)); if(error)throw error; return data;
    }
    async upload(blob) {
      const path=this.ownerId+'/'+crypto.randomUUID();
      const {error}=await this.bucket.upload(path,blob,{contentType:blob.type,upsert:false}); if(error)throw error;
      const id='cloud:'+path; this.photos.set(id,URL.createObjectURL(blob)); return {id};
    }
    async removePhoto(id) {
      const {error}=await this.bucket.remove([this.path(id)]); if(error)throw error;
      URL.revokeObjectURL(this.photos.get(id));this.photos.delete(id);
    }
    async hydrate(records) {
      for(const rec of records) for(const id of rec.photos || []) {
        if(!id.startsWith('cloud:')) continue;
        if(!this.photos.has(id)) {
          try { const blob=await this.download(id);if(!this.closed)this.photos.set(id,URL.createObjectURL(blob)); }
          catch { this.onError(new Error('An item photo could not load. Refresh to retry; its record is preserved.')); }
        }
      }
    }
    collection(name) {
      if(!['items','outfits'].includes(name))throw new Error('Unknown collection');
      const table='dc_'+name, self=this;
      return {
        async read() {
          const result=[];
          // Supabase commonly caps responses at 1,000 rows: page explicitly.
          for(let offset=0;;offset+=500) {
            const {data,error}=await self.client.from(table).select('record').eq('user_id',self.ownerId).order('id').range(offset,offset+499);
            if(error)throw error;result.push(...data.map(row=>row.record));if(data.length<500)break;
          }
          await self.hydrate(result);return result;
        },
        onSnapshot(callback,onError) {
          let busy=false, active=true;
          const poll=async()=>{
            if(busy||!active||self.closed)return;busy=true;
            try{const rows=await this.read();if(active&&!self.closed)callback({docs:rows.map(rec=>({data:()=>rec}))});}
            catch(e){if(active)onError?.(e);}finally{busy=false;}
          };
          const sub={name,poll,stop:()=>{active=false;clearInterval(timer);}};
          const timer=setInterval(poll,30000);self.subscriptions.add(sub);poll();
          return ()=>{sub.stop();self.subscriptions.delete(sub);};
        },
        doc(id) { return {
          async set(record) {
            const {error}=await self.client.from(table).upsert({user_id:self.ownerId,id,record},{onConflict:'user_id,id'});if(error)throw error;
          },
          async delete() {
            const {error}=await self.client.from(table).delete().eq('user_id',self.ownerId).eq('id',id);if(error)throw error;
          }
        }; }
      };
    }
    refresh() { for(const sub of this.subscriptions)sub.poll(); }
    close() {
      this.closed=true;for(const sub of this.subscriptions)sub.stop();this.subscriptions.clear();
      for(const url of this.photos.values())URL.revokeObjectURL(url);this.photos.clear();
    }
  }
  root.ClosetCloud={validateConfig,loadSDK,Adapter:ClosetCloud};
  if(typeof module!=='undefined')module.exports=root.ClosetCloud;
})(typeof window==='undefined'?globalThis:window);
