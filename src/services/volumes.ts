import Axios from 'axios';
import { API_ROOT } from 'src/constants';

type GetVolumesPage = Promise<Linode.ResourcePage<Linode.Volume>>;
export const getVolumesPage = (page: number): GetVolumesPage =>
  Axios
    .get(`${API_ROOT}/volumes/?page=${page}`)
    .then(response => response.data);

export const getVolumes = (): Promise<Linode.ResourcePage<Linode.Volume>> =>
  getVolumesPage(1);

export const attach = (volumeId: number, payload: {
  linode_id: number,
  config_id?: number,
}): Promise<{}> =>
  Axios
    .post(`${API_ROOT}/volumes/${volumeId}/attach`, payload);

export const detach = (volumeId: number): Promise<{}> =>
  Axios
    .post(`${API_ROOT}/volumes/${volumeId}/detach`);

/* delete is a reserved word */
export const _delete = (volumeId: number): Promise<{}> =>
  Axios
    .delete(`${API_ROOT}/volumes/${volumeId}`);

export const clone = (volumeId: number, label: string): Promise<{}> =>
  Axios
    .post(`${API_ROOT}/volumes/${volumeId}/clone`, { label });

export const resize = (volumeId: number, size: number): Promise<{}> =>
  Axios
    .post(`${API_ROOT}/volumes/${volumeId}/resize`, { size });

export const update = (volumeId: number, label: string): Promise<{}> =>
  Axios
    .put(`${API_ROOT}/volumes/${volumeId}`, { label });

export type VolumeRequestPayload = {
  label: string,
  size: number,
  region?: string,
  linode_id?: number,
};

export const create = (payload: VolumeRequestPayload): Promise<{}> =>
  Axios
    .post(`${API_ROOT}/volumes`, payload);
